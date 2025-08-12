package com.racingteam.model;

public enum EventType {
    RACE("Carrera", "Evento de competición oficial"),
    TEST("Test", "Sesión de pruebas y desarrollo"),
    PRACTICE("Entrenamientos", "Sesión de entrenamientos"),
    QUALIFYING("Clasificación", "Sesión de clasificación"),
    TRAINING("Formación", "Entrenamiento del equipo"),
    TRAVEL("Viaje", "Desplazamiento del equipo"),
    MEETING("Reunión", "Reunión del equipo o con sponsors"),
    MAINTENANCE("Mantenimiento", "Sesión de mantenimiento programado"),
    PRESENTATION("Presentación", "Presentación del equipo o vehículo"),
    MEDIA("Medios", "Evento mediático o promocional"),
    SPONSOR_EVENT("Evento Sponsor", "Evento relacionado con sponsors"),
    SHAKEDOWN("Shakedown", "Primera prueba de vehículo nuevo o modificado"),
    TRACKDAY("Trackday", "Día de pista abierto"),
    OTHER("Otro", "Otro tipo de evento");

    private final String displayName;
    private final String description;

    EventType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public boolean isCompetitive() {
        return this == RACE || this == QUALIFYING;
    }

    public boolean isOnTrack() {
        return this == RACE || this == TEST || this == PRACTICE || 
               this == QUALIFYING || this == SHAKEDOWN || this == TRACKDAY;
    }

    public boolean requiresVehicle() {
        return isOnTrack() || this == MAINTENANCE;
    }

    public boolean isPublic() {
        return this == RACE || this == PRESENTATION || this == MEDIA || this == SPONSOR_EVENT;
    }
}