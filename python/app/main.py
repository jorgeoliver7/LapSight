"""Microservicio Python de analytics para Racing Team Management.

Recibe vueltas crudas desde el backend Java y devuelve análisis avanzado
con pandas, numpy, scipy y scikit-learn.
"""
from __future__ import annotations

import logging

from fastapi import FastAPI

from .analytics import (
    compute_degradation,
    compute_heatmap,
    compute_stats,
    detect_anomalies,
    detect_stints,
    laps_to_dataframe,
)
from .schemas import (
    AnomaliesResponse,
    DegradationResponse,
    HeatmapResponse,
    LapsPayload,
    StatsResponse,
    StintsResponse,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rtm-analytics")

app = FastAPI(
    title="Racing Team Management — Analytics",
    description=(
        "Análisis avanzado de tiempos por vuelta: estadísticas, detección de stints "
        "(KMeans), anomalías (IsolationForest), modelos de degradación polinómica."
    ),
    version="1.0.0",
)


@app.get("/health")
def health() -> dict:
    return {"status": "UP"}


@app.post("/analyze/laptimes", response_model=StatsResponse)
def analyze_laptimes(payload: LapsPayload) -> dict:
    df = laps_to_dataframe(payload.laps)
    return compute_stats(df)


@app.post("/analyze/stints", response_model=StintsResponse)
def analyze_stints(payload: LapsPayload) -> dict:
    df = laps_to_dataframe(payload.laps)
    return detect_stints(df)


@app.post("/analyze/anomalies", response_model=AnomaliesResponse)
def analyze_anomalies(payload: LapsPayload) -> dict:
    df = laps_to_dataframe(payload.laps)
    return detect_anomalies(df)


@app.post("/analyze/degradation", response_model=DegradationResponse)
def analyze_degradation(payload: LapsPayload) -> dict:
    df = laps_to_dataframe(payload.laps)
    return compute_degradation(df)


@app.post("/analyze/heatmap", response_model=HeatmapResponse)
def analyze_heatmap(payload: LapsPayload) -> dict:
    df = laps_to_dataframe(payload.laps)
    return compute_heatmap(df)
