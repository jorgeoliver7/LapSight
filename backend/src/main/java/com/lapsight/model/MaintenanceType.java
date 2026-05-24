package com.lapsight.model;

public enum MaintenanceType {
    PREVENTIVE("Preventive", "Regular scheduled maintenance"),
    CORRECTIVE("Corrective", "Failure or breakdown repair"),
    INSPECTION("Inspection", "Technical review or inspection"),
    SETUP("Setup", "Vehicle configuration and adjustments"),
    UPGRADE("Upgrade", "Component update or upgrade"),
    SEASONAL("Seasonal", "Seasonal maintenance"),
    POST_EVENT("Post-event", "Inspection after race or test"),
    PRE_EVENT("Pre-event", "Preparation before race or test");

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