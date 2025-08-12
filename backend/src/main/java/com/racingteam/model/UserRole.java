package com.racingteam.model;

public enum UserRole {
    MANAGER("Manager del Equipo", "Gestión completa del equipo"),
    PILOT("Piloto", "Piloto del equipo"),
    MECHANIC("Mecánico", "Mantenimiento y reparación de vehículos"),
    ENGINEER("Ingeniero", "Análisis técnico y setup"),
    LOGISTICS("Logística", "Gestión de viajes y transporte"),
    FINANCE("Finanzas", "Gestión financiera y sponsors"),
    MEDIA("Medios", "Comunicación y redes sociales"),
    GUEST("Invitado", "Acceso limitado de solo lectura");

    private final String displayName;
    private final String description;

    UserRole(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    // Métodos para verificar permisos
    public boolean canManageTeam() {
        return this == MANAGER;
    }

    public boolean canManageFinances() {
        return this == MANAGER || this == FINANCE;
    }

    public boolean canManageVehicles() {
        return this == MANAGER || this == MECHANIC || this == ENGINEER;
    }

    public boolean canManageInventory() {
        return this == MANAGER || this == MECHANIC || this == LOGISTICS;
    }

    public boolean canManageEvents() {
        return this == MANAGER || this == LOGISTICS;
    }

    public boolean canViewFinances() {
        return this == MANAGER || this == FINANCE;
    }

    public boolean isReadOnly() {
        return this == GUEST;
    }
}