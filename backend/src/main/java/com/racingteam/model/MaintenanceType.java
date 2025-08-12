package com.racingteam.model;

public enum MaintenanceType {
    PREVENTIVE("Preventivo", "Mantenimiento programado regular"),
    CORRECTIVE("Correctivo", "Reparación de fallo o avería"),
    INSPECTION("Inspección", "Revisión técnica o inspección"),
    SETUP("Setup", "Configuración y ajustes del vehículo"),
    UPGRADE("Mejora", "Actualización o mejora de componentes"),
    SEASONAL("Estacional", "Mantenimiento de temporada"),
    POST_EVENT("Post-evento", "Revisión después de carrera o test"),
    PRE_EVENT("Pre-evento", "Preparación antes de carrera o test");

    private final String displayName;
    private final String description;

    MaintenanceType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public boolean isScheduled() {
        return this == PREVENTIVE || this == INSPECTION || this == SEASONAL;
    }

    public boolean isEventRelated() {
        return this == POST_EVENT || this == PRE_EVENT || this == SETUP;
    }
}