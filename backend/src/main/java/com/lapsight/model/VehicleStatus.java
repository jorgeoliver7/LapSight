package com.lapsight.model;

public enum VehicleStatus {
    AVAILABLE("Available", "The vehicle is ready to use"),
    IN_USE("In use", "The vehicle is currently being used"),
    MAINTENANCE("In maintenance", "The vehicle is in maintenance"),
    REPAIR("In repair", "The vehicle needs repair"),
    OUT_OF_SERVICE("Out of service", "The vehicle is not operational"),
    TRANSPORT("In transport", "The vehicle is being transported");

    private final String displayName;
    private final String description;

    VehicleStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public boolean isAvailable() {
        return this == AVAILABLE;
    }

    public boolean needsAttention() {
        return this == MAINTENANCE || this == REPAIR || this == OUT_OF_SERVICE;
    }
}