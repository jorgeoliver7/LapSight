package com.lapsight.model;

public enum TrackCondition {
    DRY("Dry"),
    WET("Wet"),
    MIXED("Mixed"),
    DAMP("Damp");

    private final String displayName;

    TrackCondition(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
