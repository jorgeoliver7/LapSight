"""Tests unitarios de los cálculos analíticos.

Probamos cada función con datasets sintéticos que cubren los casos clave:
- Sesión vacía / mínima
- Sesión con vuelta inválida (debe excluirse de stats)
- Stints por compound vs por KMeans
- Anomalías inducidas
- Degradación lineal vs polinómica
"""
from __future__ import annotations

import pandas as pd

from app.analytics import (
    compute_degradation,
    compute_heatmap,
    compute_stats,
    detect_anomalies,
    detect_stints,
)
from app.schemas import LapInput


def _make_laps(rows: list[dict]) -> pd.DataFrame:
    """Helper: convierte lista de dicts a DataFrame con defaults."""
    defaults = {"valid": True, "compound": None,
                "sector1_ms": None, "sector2_ms": None, "sector3_ms": None}
    full = [{**defaults, **r} for r in rows]
    return pd.DataFrame(full)


def test_stats_basic():
    df = _make_laps([
        {"lap_number": 1, "lap_time_ms": 80000},
        {"lap_number": 2, "lap_time_ms": 78000},
        {"lap_number": 3, "lap_time_ms": 79000},
    ])
    stats = compute_stats(df)
    assert stats["total_laps"] == 3
    assert stats["valid_laps"] == 3
    assert stats["best_lap_ms"] == 78000
    assert stats["best_lap_number"] == 2
    assert stats["average_ms"] == 79000
    assert stats["median_ms"] == 79000
    assert stats["coefficient_of_variation"] is not None
    assert 0 <= stats["coefficient_of_variation"] < 0.1


def test_stats_excludes_invalid():
    df = _make_laps([
        {"lap_number": 1, "lap_time_ms": 78000, "valid": True},
        {"lap_number": 2, "lap_time_ms": 200000, "valid": False},  # vuelta basura
        {"lap_number": 3, "lap_time_ms": 78500, "valid": True},
    ])
    stats = compute_stats(df)
    assert stats["valid_laps"] == 2
    assert stats["invalid_laps"] == 1
    assert stats["best_lap_ms"] == 78000
    assert stats["worst_lap_ms"] == 78500  # No el inválido


def test_stats_empty_session():
    df = _make_laps([])
    stats = compute_stats(df)
    assert stats["total_laps"] == 0
    assert stats["valid_laps"] == 0
    assert "best_lap_ms" not in stats or stats.get("best_lap_ms") is None


def test_stints_compound_based():
    # 5 vueltas SOFT seguidas de 5 MEDIUM → 2 stints por compound
    rows = [{"lap_number": i, "lap_time_ms": 80000, "compound": "SOFT"} for i in range(1, 6)]
    rows += [{"lap_number": i, "lap_time_ms": 82000, "compound": "MEDIUM"} for i in range(6, 11)]
    df = _make_laps(rows)
    result = detect_stints(df)
    assert result["method"] == "compound-based"
    assert result["n_stints"] == 2
    assert result["stints"][0]["dominant_compound"] == "SOFT"
    assert result["stints"][1]["dominant_compound"] == "MEDIUM"
    assert result["stints"][0]["laps_count"] == 5


def test_stints_kmeans_when_no_compound():
    # Sin compound, KMeans debe detectar el cambio de pace
    rows = [{"lap_number": i, "lap_time_ms": 78000 + i * 30} for i in range(1, 6)]
    rows += [{"lap_number": i, "lap_time_ms": 82000 + (i - 6) * 30} for i in range(6, 11)]
    df = _make_laps(rows)
    result = detect_stints(df)
    assert result["method"] == "kmeans-1d"
    assert result["n_stints"] >= 1


def test_anomalies_detects_outlier():
    # Una sesión limpia con UNA vuelta clarísimamente anómala
    rows = [{"lap_number": i, "lap_time_ms": 78000 + (i % 3) * 50} for i in range(1, 12)]
    rows.append({"lap_number": 12, "lap_time_ms": 95000})  # outlier obvio
    df = _make_laps(rows)
    result = detect_anomalies(df)
    assert result["method"] == "isolation-forest"
    flagged = {a["lap_number"] for a in result["anomalies"] if a["is_anomaly"]}
    assert 12 in flagged


def test_degradation_linear_vs_polynomial():
    # Vueltas con degradación lineal pura → lineal gana
    df = _make_laps([
        {"lap_number": i, "lap_time_ms": 78000 + i * 100} for i in range(1, 11)
    ])
    result = compute_degradation(df)
    assert result["linear"]["r_squared"] > 0.95
    # En este caso polynomial no debería mejorar mucho → chosen = linear
    assert result["chosen"] == "linear"


def test_degradation_polynomial_when_curve():
    # Patrón out-lap + estabilización + degradación = curva
    times = [85000, 78500, 78300, 78400, 78600, 78800, 79100, 79500, 80000]
    df = _make_laps([{"lap_number": i + 1, "lap_time_ms": t} for i, t in enumerate(times)])
    result = compute_degradation(df)
    assert result["polynomial"]["r_squared"] > result["linear"]["r_squared"]
    assert result["chosen"] == "polynomial"


def test_heatmap_gap_calculation():
    df = _make_laps([
        {"lap_number": 1, "lap_time_ms": 80000,
         "sector1_ms": 27000, "sector2_ms": 28000, "sector3_ms": 25000},
        {"lap_number": 2, "lap_time_ms": 79000,
         "sector1_ms": 26500, "sector2_ms": 28500, "sector3_ms": 24000},
    ])
    result = compute_heatmap(df)
    # Best S1 = 26500 (lap 2). Gap lap 1 S1 = 27000 - 26500 = 500
    assert result["best_ms_per_sector"][0] == 26500
    assert result["gap_ms"][0][0] == 500  # lap 1, sector 1
    assert result["gap_ms"][0][1] == 0    # lap 2, sector 1 (es el mejor)
