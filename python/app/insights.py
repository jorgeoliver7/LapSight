"""Insights automáticos sobre una sesión.

A diferencia de las stats puras, los insights son **texto procesable por humano**:
cada uno responde a una pregunta que se haría un ingeniero de pista. Buscan
hallazgos no obvios y los expresan en lenguaje natural.

Reglas implementadas:
  - Theoretical best vs best lap (cuánto dejas en mesa)
  - Distribución de tiempos perdidos por sector
  - Consistencia comparada con umbrales empíricos
  - Degradación: pendiente y dirección
  - Outliers que el usuario no marcó como inválidos
  - Comparativa entre stints (si hay >1)
  - Comparativa de la mejor vuelta vs media
"""
from __future__ import annotations

from typing import List

import pandas as pd

from .analytics import (
    compute_degradation,
    compute_heatmap,
    compute_stats,
    detect_anomalies,
    detect_stints,
)


def format_seconds(ms: float) -> str:
    s = ms / 1000
    if s < 60:
        return f"{s:.3f}s"
    m = int(s // 60)
    s -= m * 60
    return f"{m}:{s:06.3f}"


def generate_insights(df: pd.DataFrame) -> List[dict]:
    insights: List[dict] = []

    stats = compute_stats(df)
    if stats.get("valid_laps", 0) < 2:
        return [{
            "severity": "info",
            "icon": "ℹ️",
            "title": "Sesión muy corta",
            "detail": "Se necesitan al menos 2 vueltas válidas para generar insights.",
        }]

    # 1. Theoretical best vs best lap
    heatmap = compute_heatmap(df)
    best_per_sector = heatmap.get("best_ms_per_sector", [])
    valid_secs = [s for s in best_per_sector if s is not None]
    if len(valid_secs) == 3:
        theoretical = sum(valid_secs)
        best = stats["best_lap_ms"]
        gap = best - theoretical
        if gap > 100:
            insights.append({
                "severity": "warning",
                "icon": "🎯",
                "title": f"Dejas {format_seconds(gap)} sobre la mesa",
                "detail": (
                    f"Tu mejor vuelta ({format_seconds(best)}) es {format_seconds(gap)} más lenta que tu "
                    f"theoretical best ({format_seconds(theoretical)}). Si encadenaras tus mejores 3 sectores "
                    f"en una sola vuelta, ese tiempo sería tuyo."
                ),
            })
        else:
            insights.append({
                "severity": "success",
                "icon": "🏆",
                "title": "Vuelta casi perfecta",
                "detail": (
                    f"Tu mejor vuelta está a sólo {format_seconds(gap)} del theoretical best — "
                    "sectores muy bien encadenados."
                ),
            })

    # 2. Sector más débil (gap medio vs best)
    sec_avgs = {}
    for i, sec_name in enumerate(["S1", "S2", "S3"]):
        gaps = [row for row in heatmap.get("gap_ms", [[]])[i] if row is not None]
        if gaps:
            sec_avgs[sec_name] = sum(gaps) / len(gaps)
    if sec_avgs:
        worst = max(sec_avgs, key=sec_avgs.get)
        gap = sec_avgs[worst]
        if gap > 200:
            insights.append({
                "severity": "warning",
                "icon": "🐢",
                "title": f"Tu sector más débil: {worst}",
                "detail": (
                    f"En {worst} pierdes de media {format_seconds(gap)} respecto a tu mejor {worst}. "
                    "Trabaja ese tramo: revisa entrada, apex y trazada."
                ),
            })

    # 3. Consistencia (CoV)
    cov = stats.get("coefficient_of_variation")
    if cov is not None:
        cov_pct = cov * 100
        std_str = format_seconds(stats["std_dev_ms"])
        if cov_pct < 0.8:
            insights.append({
                "severity": "success",
                "icon": "📐",
                "title": f"Consistencia excelente ({cov_pct:.2f}%)",
                "detail": f"Desviación típica de sólo ±{std_str}. Pace muy estable, característico de pilotos rápidos.",
            })
        elif cov_pct < 1.5:
            insights.append({
                "severity": "info",
                "icon": "📊",
                "title": f"Consistencia razonable ({cov_pct:.2f}%)",
                "detail": f"Desviación típica ±{std_str}. Hay margen para apretar la repetibilidad vuelta a vuelta.",
            })
        else:
            insights.append({
                "severity": "warning",
                "icon": "📉",
                "title": f"Consistencia mejorable ({cov_pct:.2f}%)",
                "detail": (
                    f"Desviación típica ±{std_str}, alta para la duración de la sesión. "
                    "Mira si hay vueltas anómalas o si te falta consistencia técnica."
                ),
            })

    # 4. Degradación
    deg = compute_degradation(df)
    if deg["chosen"] == "polynomial" and deg["polynomial"]["r_squared"] > 0.5:
        insights.append({
            "severity": "info",
            "icon": "🔁",
            "title": "Patrón no lineal",
            "detail": (
                f"Tus tiempos siguen una curva mejor que una recta (R² lineal {deg['linear']['r_squared']:.2f} "
                f"vs polinómico {deg['polynomial']['r_squared']:.2f}). Típico de out lap + estabilización "
                "o estrategia de gestión de gomas."
            ),
        })
    else:
        slope = deg["linear"]["coefficients"][0] if len(deg["linear"]["coefficients"]) >= 2 else 0
        if slope > 50:
            insights.append({
                "severity": "warning",
                "icon": "🛞",
                "title": f"Degradación de {slope:.0f} ms/vuelta",
                "detail": (
                    f"Pierdes {slope/1000:.3f}s por vuelta de media. Si vas a hacer stints largos, "
                    "considera revisar presiones, compound o estilo de pilotaje."
                ),
            })
        elif slope < -50:
            insights.append({
                "severity": "success",
                "icon": "📈",
                "title": "Tiempos mejoran vuelta a vuelta",
                "detail": (
                    f"Estás bajando {-slope/1000:.3f}s por vuelta de media. Buen signo de adaptación "
                    "o calentamiento progresivo."
                ),
            })

    # 5. Outliers automáticos
    anomalies = detect_anomalies(df)
    if anomalies["n_anomalies"] > 0:
        anom_laps = [a["lap_number"] for a in anomalies["anomalies"] if a["is_anomaly"]]
        if len(anom_laps) <= 3:
            insights.append({
                "severity": "info",
                "icon": "🚩",
                "title": f"{len(anom_laps)} vuelta(s) anómala(s) detectadas",
                "detail": (
                    f"IsolationForest marcó las vueltas {', '.join(map(str, anom_laps))} como atípicas "
                    "(probable pit / sale / bandera amarilla). Considera marcarlas como inválidas para limpiar las stats."
                ),
            })

    # 6. Stints
    stints = detect_stints(df)
    if stints["n_stints"] >= 2:
        best_stint_idx = min(
            range(len(stints["stints"])),
            key=lambda i: stints["stints"][i]["best_ms"],
        )
        worst_stint_idx = max(
            range(len(stints["stints"])),
            key=lambda i: stints["stints"][i]["best_ms"],
        )
        if best_stint_idx != worst_stint_idx:
            diff = stints["stints"][worst_stint_idx]["best_ms"] - stints["stints"][best_stint_idx]["best_ms"]
            if diff > 200:
                compound_b = stints["stints"][best_stint_idx].get("dominant_compound") or "Stint"
                compound_w = stints["stints"][worst_stint_idx].get("dominant_compound") or "Stint"
                insights.append({
                    "severity": "info",
                    "icon": "🔀",
                    "title": "Diferencia clara entre stints",
                    "detail": (
                        f"Stint con {compound_b} es {format_seconds(diff)} más rápido que con {compound_w}. "
                        "Útil para decidir estrategia de carrera."
                    ),
                })

    # 7. Best lap context
    avg = stats.get("average_ms")
    best = stats.get("best_lap_ms")
    if avg and best:
        gap_avg = avg - best
        insights.append({
            "severity": "info",
            "icon": "⭐",
            "title": f"Mejor vuelta: {format_seconds(best)}",
            "detail": (
                f"Tu media está a {format_seconds(gap_avg)} de tu mejor vuelta — "
                f"{'estás apretando casi todas las vueltas' if gap_avg < 500 else 'puedes ser más constante cerca del límite'}."
            ),
        })

    return insights
