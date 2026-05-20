package com.lapsight.model;

public enum TireCompound {
    SOFT("Blando"),
    MEDIUM("Medio"),
    HARD("Duro"),
    INTERMEDIATE("Intermedio"),
    WET("Lluvia"),
    SLICK("Slick"),
    RAIN("Rain"),
    UNKNOWN("Desconocido");

    private final String displayName;

    TireCompound(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
