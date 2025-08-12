package com.racingteam.model;

public enum EventStatus {
    PLANNED("Planificado", "Evento planificado pero no confirmado"),
    CONFIRMED("Confirmado", "Evento confirmado y programado"),
    IN_PROGRESS("En curso", "Evento actualmente en desarrollo"),
    COMPLETED("Completado", "Evento finalizado exitosamente"),
    CANCELLED("Cancelado", "Evento cancelado"),
    POSTPONED("Pospuesto", "Evento pospuesto a nueva fecha"),
    WEATHER_DELAY("Retraso por clima", "Evento retrasado por condiciones climáticas"),
    TECHNICAL_ISSUE("Problema técnico", "Evento afectado por problemas técnicos");

    private final String displayName;
    private final String description;

    EventStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public boolean isActive() {
        return this == CONFIRMED || this == IN_PROGRESS;
    }

    public boolean isFinished() {
        return this == COMPLETED || this == CANCELLED;
    }

    public boolean canBeModified() {
        return this == PLANNED || this == CONFIRMED || this == POSTPONED;
    }

    public boolean requiresAttention() {
        return this == WEATHER_DELAY || this == TECHNICAL_ISSUE || this == POSTPONED;
    }
}