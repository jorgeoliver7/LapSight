package com.lapsight.model;

public enum EventType {
    RACE("Race", "Official competition event"),
    TEST("Test", "Testing and development session"),
    PRACTICE("Practice", "Practice session"),
    QUALIFYING("Qualifying", "Qualifying session"),
    TRAINING("Training", "Team training"),
    TRAVEL("Travel", "Team transfer"),
    MEETING("Meeting", "Team or sponsor meeting"),
    MAINTENANCE("Maintenance", "Scheduled maintenance session"),
    PRESENTATION("Presentation", "Team or vehicle presentation"),
    MEDIA("Media", "Media or promotional event"),
    SPONSOR_EVENT("Sponsor Event", "Sponsor-related event"),
    SHAKEDOWN("Shakedown", "First test of new or modified vehicle"),
    TRACKDAY("Trackday", "Open track day"),
    OTHER("Other", "Other event type");

    private final String displayName;
    private final String description;

    EventType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public boolean isCompetitive() {
        return this == RACE || this == QUALIFYING;
    }

    public boolean isOnTrack() {
        return this == RACE || this == TEST || this == PRACTICE || 
               this == QUALIFYING || this == SHAKEDOWN || this == TRACKDAY;
    }

    public boolean requiresVehicle() {
        return isOnTrack() || this == MAINTENANCE;
    }

    public boolean isPublic() {
        return this == RACE || this == PRESENTATION || this == MEDIA || this == SPONSOR_EVENT;
    }
}