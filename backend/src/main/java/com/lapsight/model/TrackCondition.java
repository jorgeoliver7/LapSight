package com.lapsight.model;

public enum TrackCondition {
    DRY("Seco"),
    WET("Lluvia"),
    MIXED("Mixto"),
    DAMP("Húmedo");

    private final String displayName;

    TrackCondition(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
