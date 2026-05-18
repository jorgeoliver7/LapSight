package com.racingteam.dto.analytics;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.racingteam.model.LapTime;

/** Vuelta enviada al microservicio Python. Las claves coinciden con el schema Pydantic. */
public record AnalyticsLapDto(
        @JsonProperty("lapNumber") Integer lapNumber,
        @JsonProperty("lapTimeMs") Long lapTimeMs,
        @JsonProperty("sector1Ms") Long sector1Ms,
        @JsonProperty("sector2Ms") Long sector2Ms,
        @JsonProperty("sector3Ms") Long sector3Ms,
        @JsonProperty("valid") Boolean valid,
        @JsonProperty("compound") String compound
) {
    public static AnalyticsLapDto fromEntity(LapTime lap) {
        return new AnalyticsLapDto(
                lap.getLapNumber(),
                lap.getLapTimeMs(),
                lap.getSector1Ms(),
                lap.getSector2Ms(),
                lap.getSector3Ms(),
                lap.getValid(),
                lap.getCompound() != null ? lap.getCompound().name() : null
        );
    }
}
