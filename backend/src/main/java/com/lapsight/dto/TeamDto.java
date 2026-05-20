package com.lapsight.dto;

import com.lapsight.model.Team;
import com.lapsight.model.VehicleCategory;

import java.time.LocalDateTime;

public class TeamDto {

    private Long id;
    private String name;
    private String description;
    private String logoUrl;
    private VehicleCategory primaryCategory;
    private String contactEmail;
    private String contactPhone;
    private String headquartersLocation;
    private Boolean active;
    private LocalDateTime createdAt;
    private Integer membersCount;
    private Integer vehiclesCount;

    public TeamDto() {}

    public static TeamDto fromEntity(Team team) {
        TeamDto dto = new TeamDto();
        dto.id = team.getId();
        dto.name = team.getName();
        dto.description = team.getDescription();
        dto.logoUrl = team.getLogoUrl();
        dto.primaryCategory = team.getPrimaryCategory();
        dto.contactEmail = team.getContactEmail();
        dto.contactPhone = team.getContactPhone();
        dto.headquartersLocation = team.getHeadquartersLocation();
        dto.active = team.getActive();
        dto.createdAt = team.getCreatedAt();
        dto.membersCount = team.getMembers() != null ? team.getMembers().size() : 0;
        dto.vehiclesCount = team.getVehicles() != null ? team.getVehicles().size() : 0;
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Integer getMembersCount() { return membersCount; }
    public void setMembersCount(Integer membersCount) { this.membersCount = membersCount; }
    public Integer getVehiclesCount() { return vehiclesCount; }
    public void setVehiclesCount(Integer vehiclesCount) { this.vehiclesCount = vehiclesCount; }
}
