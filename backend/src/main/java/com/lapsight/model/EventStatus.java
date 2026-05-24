package com.lapsight.model;

public enum EventStatus {
    PLANNED("Planned", "Event planned but not confirmed"),
    CONFIRMED("Confirmed", "Event confirmed and scheduled"),
    IN_PROGRESS("In progress", "Event currently underway"),
    COMPLETED("Completed", "Event finished successfully"),
    CANCELLED("Cancelled", "Event cancelled"),
    POSTPONED("Postponed", "Event postponed to a new date"),
    WEATHER_DELAY("Weather delay", "Event delayed by weather conditions"),
    TECHNICAL_ISSUE("Technical issue", "Event affected by technical issues");

    private final String displayName;
    private final String description;

    EventStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public boolean isActive() {
        return this == CONFIRMED || this == IN_PROGRESS;
    }

    public boolean isFinished() {
        return this == COMPLETED || this == CANCELLED;
    }

    public boolean canBeModified() {
        return this == PLANNED || this == CONFIRMED || this == POSTPONED;
    }

    public boolean requiresAttention() {
        return this == WEATHER_DELAY || this == TECHNICAL_ISSUE || this == POSTPONED;
    }
}