package com.lapsight.dto.analytics;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

public record DegradationResponseDto(
        DegradationModel linear,
        DegradationModel polynomial,
        String chosen
) {
    public record DegradationModel(
            Integer degree,
            List<Double> coefficients,
            @JsonProperty("r_squared") Double rSquared,
            @JsonProperty("predicted_at_lap") Map<String, Double> predictedAtLap
    ) {}
}
