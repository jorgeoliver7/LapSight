package com.lapsight.dto.analytics;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

public record StintsResponseDto(
        String method,
        @JsonProperty("n_stints") Integer nStints,
        List<StintCluster> stints,
        @JsonProperty("lap_to_stint") Map<String, Integer> lapToStint
) {
    public record StintCluster(
            @JsonProperty("stint_index") Integer stintIndex,
            @JsonProperty("lap_numbers") List<Integer> lapNumbers,
            @JsonProperty("laps_count") Integer lapsCount,
            @JsonProperty("mean_ms") Double meanMs,
            @JsonProperty("best_ms") Long bestMs,
            @JsonProperty("degradation_ms_per_lap") Double degradationMsPerLap,
            @JsonProperty("dominant_compound") String dominantCompound
    ) {}
}
