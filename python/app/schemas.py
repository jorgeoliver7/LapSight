"""Pydantic schemas que comparten Java y Python por contrato HTTP JSON."""
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class LapInput(BaseModel):
    lap_number: int = Field(..., alias="lapNumber", ge=1)
    lap_time_ms: int = Field(..., alias="lapTimeMs", gt=0)
    sector1_ms: Optional[int] = Field(None, alias="sector1Ms")
    sector2_ms: Optional[int] = Field(None, alias="sector2Ms")
    sector3_ms: Optional[int] = Field(None, alias="sector3Ms")
    valid: bool = True
    compound: Optional[str] = None

    model_config = {"populate_by_name": True}


class LapsPayload(BaseModel):
    laps: List[LapInput]


class StatsResponse(BaseModel):
    total_laps: int
    valid_laps: int
    invalid_laps: int
    best_lap_ms: Optional[int] = None
    best_lap_number: Optional[int] = None
    worst_lap_ms: Optional[int] = None
    average_ms: Optional[float] = None
    median_ms: Optional[float] = None
    std_dev_ms: Optional[float] = None
    p25_ms: Optional[float] = None
    p75_ms: Optional[float] = None
    iqr_ms: Optional[float] = None
    coefficient_of_variation: Optional[float] = None  # std / mean


class StintCluster(BaseModel):
    """Stint detectado automáticamente."""
    stint_index: int
    lap_numbers: List[int]
    laps_count: int
    mean_ms: float
    best_ms: int
    degradation_ms_per_lap: Optional[float] = None
    dominant_compound: Optional[str] = None


class StintsResponse(BaseModel):
    method: str = "kmeans-1d"
    n_stints: int
    stints: List[StintCluster]
    lap_to_stint: dict[int, int]  # lap_number → stint_index


class AnomalyResult(BaseModel):
    lap_number: int
    is_anomaly: bool
    anomaly_score: float  # más negativo = más anómalo


class AnomaliesResponse(BaseModel):
    method: str = "isolation-forest"
    anomalies: List[AnomalyResult]
    n_anomalies: int


class DegradationModel(BaseModel):
    """Modelo polinómico para degradación de vueltas válidas."""
    degree: int
    coefficients: List[float]  # del término más alto al independiente
    r_squared: float
    predicted_at_lap: dict[int, float]  # lap_number → predicción ms


class DegradationResponse(BaseModel):
    linear: DegradationModel
    polynomial: DegradationModel
    chosen: str  # "linear" o "polynomial" según mejor R²


class Insight(BaseModel):
    severity: str  # "info" | "success" | "warning" | "error"
    icon: str      # emoji corto
    title: str
    detail: str


class InsightsResponse(BaseModel):
    insights: List[Insight]


class HeatmapResponse(BaseModel):
    """Datos para heatmap sector × vuelta. Devuelve gap respecto al best sector."""
    lap_numbers: List[int]
    sectors: List[str]  # ["S1", "S2", "S3"]
    gap_ms: List[List[Optional[int]]]  # gap_ms[sector_idx][lap_idx]
    best_ms_per_sector: List[Optional[int]]


class ReportRequest(BaseModel):
    """Petición de PDF: metadatos de sesión + lista de vueltas."""
    session_name: Optional[str] = None
    circuit: Optional[str] = None
    session_date: Optional[str] = None
    session_type: Optional[str] = None
    track_condition: Optional[str] = None
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None
    driver_name: Optional[str] = None
    vehicle_name: Optional[str] = None
    team_name: Optional[str] = None
    laps: List[LapInput]
