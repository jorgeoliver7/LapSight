package com.lapsight.model;

public enum UserRole {
    MANAGER("Team Manager", "Full team management"),
    PILOT("Driver", "Team driver"),
    MECHANIC("Mechanic", "Vehicle maintenance and repair"),
    ENGINEER("Engineer", "Technical analysis and setup"),
    LOGISTICS("Logistics", "Travel and transport management"),
    FINANCE("Finance", "Financial and sponsor management"),
    MEDIA("Media", "Communications and social media"),
    GUEST("Guest", "Limited read-only access");

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