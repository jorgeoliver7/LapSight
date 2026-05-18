"""Cálculos analíticos sobre tiempos por vuelta.

Cada función recibe un DataFrame de pandas y devuelve un dict / schema serializable.
La separación facilita testear los cálculos sin tocar FastAPI.
"""
from __future__ import annotations

from typing import Optional

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.ensemble import IsolationForest


def laps_to_dataframe(laps: list) -> pd.DataFrame:
    """Pasa lista de LapInput (Pydantic) → DataFrame normalizado."""
    df = pd.DataFrame([lap.model_dump(by_alias=False) for lap in laps])
    df = df.sort_values("lap_number").reset_index(drop=True)
    return df


def compute_stats(df: pd.DataFrame) -> dict:
    """Estadísticas descriptivas (sobre vueltas válidas)."""
    total = len(df)
    valid = df[df["valid"]]
    n_valid = len(valid)

    result = {
        "total_laps": total,
        "valid_laps": n_valid,
        "invalid_laps": total - n_valid,
    }

    if n_valid == 0:
        return result

    times = valid["lap_time_ms"].to_numpy()
    best_idx = valid["lap_time_ms"].idxmin()

    result.update({
        "best_lap_ms": int(valid.loc[best_idx, "lap_time_ms"]),
        "best_lap_number": int(valid.loc[best_idx, "lap_number"]),
        "worst_lap_ms": int(times.max()),
        "average_ms": float(times.mean()),
        "median_ms": float(np.median(times)),
        "std_dev_ms": float(times.std(ddof=0)),
        "p25_ms": float(np.percentile(times, 25)),
        "p75_ms": float(np.percentile(times, 75)),
        "iqr_ms": float(np.percentile(times, 75) - np.percentile(times, 25)),
        "coefficient_of_variation": float(times.std(ddof=0) / times.mean()) if times.mean() else None,
    })
    return result


def detect_stints(df: pd.DataFrame, max_stints: int = 4) -> dict:
    """Clustering 1D sobre lap_time_ms de vueltas válidas, ordenado por lap_number.

    Heurística: cada cambio sustancial de pace marca un stint nuevo (compound
    diferente, llenado de gasolina, etc.). KMeans con elección automática
    de k por método del codo simplificado (penaliza más k).

    Si hay compound informado, prefiere agrupar por compound antes que por
    pace puro (un mismo compound = un stint).
    """
    valid = df[df["valid"]].copy()
    if len(valid) < 2:
        return {"method": "none", "n_stints": 0, "stints": [], "lap_to_stint": {}}

    # Si hay compound consistente, úsalo como base de stints.
    if "compound" in valid.columns and valid["compound"].notna().any():
        valid["stint_index"] = (valid["compound"] != valid["compound"].shift()).cumsum() - 1
        method = "compound-based"
    else:
        times = valid["lap_time_ms"].to_numpy().reshape(-1, 1)
        n_samples = len(times)
        best_k, best_score = 1, float("inf")
        for k in range(1, min(max_stints, n_samples) + 1):
            km = KMeans(n_clusters=k, n_init=10, random_state=42)
            km.fit(times)
            inertia = km.inertia_
            # Penalización tipo BIC simplificada: cada cluster extra cuesta.
            score = inertia + k * (times.var() if times.var() > 0 else 1) * 0.15 * n_samples
            if score < best_score:
                best_score = score
                best_k = k
        km = KMeans(n_clusters=best_k, n_init=10, random_state=42)
        labels = km.fit_predict(times)

        # Renumera los clusters por orden de aparición para que stint 0 = primer stint
        first_seen, remap = {}, {}
        next_idx = 0
        for original_label in labels:
            if original_label not in first_seen:
                first_seen[original_label] = True
                remap[original_label] = next_idx
                next_idx += 1
        valid["stint_index"] = [remap[lbl] for lbl in labels]
        method = "kmeans-1d"

    stints = []
    for stint_idx, group in valid.groupby("stint_index"):
        times = group["lap_time_ms"].to_numpy()
        deg = None
        if len(group) >= 2:
            x = group["lap_number"].to_numpy()
            slope, _ = np.polyfit(x, times, 1)
            deg = float(slope)

        compound = None
        if "compound" in group.columns and group["compound"].notna().any():
            compound = group["compound"].mode().iloc[0]

        stints.append({
            "stint_index": int(stint_idx),
            "lap_numbers": group["lap_number"].astype(int).tolist(),
            "laps_count": len(group),
            "mean_ms": float(times.mean()),
            "best_ms": int(times.min()),
            "degradation_ms_per_lap": deg,
            "dominant_compound": compound,
        })

    lap_to_stint = dict(zip(valid["lap_number"].astype(int), valid["stint_index"].astype(int)))

    return {
        "method": method,
        "n_stints": len(stints),
        "stints": stints,
        "lap_to_stint": lap_to_stint,
    }


def detect_anomalies(df: pd.DataFrame, contamination: float = 0.1) -> dict:
    """IsolationForest sobre lap_time_ms (y sectores si están).

    Devuelve para cada vuelta su flag de anomalía y un score (más negativo = más anómalo).
    Sólo considera vueltas marcadas como válidas en el input — si el usuario ya marcó
    inválidas, no las re-evalúa.
    """
    valid = df[df["valid"]].copy()
    if len(valid) < 4:
        return {"method": "none", "anomalies": [], "n_anomalies": 0}

    features = ["lap_time_ms"]
    for sec in ("sector1_ms", "sector2_ms", "sector3_ms"):
        if sec in valid.columns and valid[sec].notna().all():
            features.append(sec)

    X = valid[features].to_numpy()
    iso = IsolationForest(contamination=contamination, random_state=42, n_estimators=100)
    preds = iso.fit_predict(X)  # 1 = normal, -1 = anomalía
    scores = iso.decision_function(X)  # más negativo = más anómalo

    anomalies = []
    n_anom = 0
    for i, lap_num in enumerate(valid["lap_number"].astype(int)):
        is_anom = preds[i] == -1
        if is_anom:
            n_anom += 1
        anomalies.append({
            "lap_number": int(lap_num),
            "is_anomaly": bool(is_anom),
            "anomaly_score": float(scores[i]),
        })

    return {
        "method": "isolation-forest",
        "anomalies": anomalies,
        "n_anomalies": n_anom,
    }


def compute_degradation(df: pd.DataFrame) -> dict:
    """Ajustes lineal y polinómico (grado 2) sobre vueltas válidas.
    Elige el modelo con mejor R² ajustado al número de parámetros.
    """
    valid = df[df["valid"]].copy()
    if len(valid) < 2:
        return {
            "linear": _empty_model(1),
            "polynomial": _empty_model(2),
            "chosen": "linear",
        }

    x = valid["lap_number"].to_numpy(dtype=float)
    y = valid["lap_time_ms"].to_numpy(dtype=float)

    linear = _fit_polynomial(x, y, degree=1)
    poly = _fit_polynomial(x, y, degree=min(2, len(x) - 1))

    # Heurística simple: usar polinómico si mejora R² en >0.1, si no lineal.
    chosen = "polynomial" if poly["r_squared"] - linear["r_squared"] > 0.1 else "linear"

    return {
        "linear": linear,
        "polynomial": poly,
        "chosen": chosen,
    }


def _fit_polynomial(x: np.ndarray, y: np.ndarray, degree: int) -> dict:
    coeffs = np.polyfit(x, y, degree)
    y_pred = np.polyval(coeffs, x)
    ss_res = np.sum((y - y_pred) ** 2)
    ss_tot = np.sum((y - np.mean(y)) ** 2)
    r2 = 1 - ss_res / ss_tot if ss_tot > 0 else 1.0
    predictions = {int(xi): float(np.polyval(coeffs, xi)) for xi in x}
    return {
        "degree": degree,
        "coefficients": coeffs.tolist(),
        "r_squared": float(r2),
        "predicted_at_lap": predictions,
    }


def _empty_model(degree: int) -> dict:
    return {
        "degree": degree,
        "coefficients": [0.0] * (degree + 1),
        "r_squared": 0.0,
        "predicted_at_lap": {},
    }


def compute_heatmap(df: pd.DataFrame) -> dict:
    """Devuelve matriz gap_ms[sector][lap] respecto al best sector global."""
    laps_sorted = df.sort_values("lap_number")
    lap_numbers = laps_sorted["lap_number"].astype(int).tolist()
    sectors_cols = ["sector1_ms", "sector2_ms", "sector3_ms"]
    sector_labels = ["S1", "S2", "S3"]

    best_per_sector: list[Optional[int]] = []
    for col in sectors_cols:
        if col in laps_sorted.columns:
            valid_sector = laps_sorted[col].dropna()
            best_per_sector.append(int(valid_sector.min()) if len(valid_sector) > 0 else None)
        else:
            best_per_sector.append(None)

    gap_matrix: list[list[Optional[int]]] = []
    for sec_idx, col in enumerate(sectors_cols):
        best = best_per_sector[sec_idx]
        row: list[Optional[int]] = []
        for _, lap in laps_sorted.iterrows():
            val = lap.get(col)
            if val is None or (isinstance(val, float) and np.isnan(val)) or best is None:
                row.append(None)
            else:
                row.append(int(val - best))
        gap_matrix.append(row)

    return {
        "lap_numbers": lap_numbers,
        "sectors": sector_labels,
        "gap_ms": gap_matrix,
        "best_ms_per_sector": best_per_sector,
    }
