package com.lapsight.dto.analytics;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record AnomaliesResponseDto(
        String method,
        List<AnomalyResult> anomalies,
        @JsonProperty("n_anomalies") Integer nAnomalies
) {
    public record AnomalyResult(
            @JsonProperty("lap_number") Integer lapNumber,
            @JsonProperty("is_anomaly") Boolean isAnomaly,
            @JsonProperty("anomaly_score") Double anomalyScore
    ) {}
}
