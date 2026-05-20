package com.lapsight.model;

public enum SessionType {
    PRACTICE("Libres"),
    QUALIFYING("Clasificación"),
    RACE("Carrera"),
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
