package com.lapsight.model;

public enum VehicleCategory {
    // Categorías principales
    CAR("Coches"),
    MOTORCYCLE("Motos");

    private final String displayName;

    VehicleCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}