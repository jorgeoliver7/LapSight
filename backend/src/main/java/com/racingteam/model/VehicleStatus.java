package com.racingteam.model;

public enum VehicleStatus {
    AVAILABLE("Disponible", "El vehículo está listo para usar"),
    IN_USE("En uso", "El vehículo está siendo utilizado"),
    MAINTENANCE("En mantenimiento", "El vehículo está en mantenimiento"),
    REPAIR("En reparación", "El vehículo necesita reparación"),
    OUT_OF_SERVICE("Fuera de servicio", "El vehículo no está operativo"),
    TRANSPORT("En transporte", "El vehículo está siendo transportado");

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