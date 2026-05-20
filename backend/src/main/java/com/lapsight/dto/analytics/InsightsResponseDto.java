package com.lapsight.dto.analytics;

import java.util.List;

public record InsightsResponseDto(List<Insight> insights) {
    public record Insight(
            String severity,  // info / success / warning / error
            String icon,
            String title,
            String detail
    ) {}
}
