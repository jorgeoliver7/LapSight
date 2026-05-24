package com.lapsight.model;

public enum SessionType {
    PRACTICE("Practice"),
    QUALIFYING("Qualifying"),
    RACE("Race"),
    TEST("Test"),
    SHAKEDOWN("Shakedown"),
    TIME_ATTACK("Time Attack");

    private final String displayName;

    SessionType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
