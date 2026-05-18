package com.racingteam.dto;

import com.racingteam.model.VehicleCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class TeamRequest {

    @NotBlank(message = "El nombre del equipo es obligatorio")
    @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String description;

    private String logoUrl;

    @NotNull(message = "La categoría principal es obligatoria")
    private VehicleCategory primaryCategory;

    private String contactEmail;
    private String contactPhone;
    private String headquartersLocation;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public VehicleCategory getPrimaryCategory() { return primaryCategory; }
    public void setPrimaryCategory(VehicleCategory primaryCategory) { this.primaryCategory = primaryCategory; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public String getHeadquartersLocation() { return headquartersLocation; }
    public void setHeadquartersLocation(String headquartersLocation) { this.headquartersLocation = headquartersLocation; }
}
