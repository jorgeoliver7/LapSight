package com.lapsight.model;

public enum VehicleCategory {
    // Categorías principales
    CAR("Cars"),
    MOTORCYCLE("Motorcycles");

    private final String displayName;

    VehicleCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}