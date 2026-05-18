package com.racingteam.dto.analytics;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record HeatmapResponseDto(
        @JsonProperty("lap_numbers") List<Integer> lapNumbers,
        List<String> sectors,
        @JsonProperty("gap_ms") List<List<Long>> gapMs,
        @JsonProperty("best_ms_per_sector") List<Long> bestMsPerSector
) {}
