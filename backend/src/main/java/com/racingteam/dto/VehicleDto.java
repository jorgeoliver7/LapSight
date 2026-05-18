package com.racingteam.dto;

import com.racingteam.model.Vehicle;
import com.racingteam.model.VehicleCategory;
import com.racingteam.model.VehicleStatus;
import com.racingteam.model.VehicleType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class VehicleDto {

    private Long id;
    private String name;
    private VehicleType vehicleType;
    private VehicleCategory category;
    private String chassisNumber;
    private String engineNumber;
    private String registrationNumber;
    private String manufacturer;
    private String model;
    private Integer yearManufactured;
    private BigDecimal totalHours;
    private BigDecimal totalKilometers;
    private LocalDateTime lastMaintenance;
    private BigDecimal nextMaintenanceHours;
    private BigDecimal nextMaintenanceKm;
    private VehicleStatus status;
    private String notes;
    private Boolean active;
    private Boolean needsMaintenance;
    private Long teamId;

    public VehicleDto() {}

    public static VehicleDto fromEntity(Vehicle vehicle) {
        VehicleDto dto = new VehicleDto();
        dto.id = vehicle.getId();
        dto.name = vehicle.getName();
        dto.vehicleType = vehicle.getVehicleType();
        dto.category = vehicle.getCategory();
        dto.chassisNumber = vehicle.getChassisNumber();
        dto.engineNumber = vehicle.getEngineNumber();
        dto.registrationNumber = vehicle.getRegistrationNumber();
        dto.manufacturer = vehicle.getManufacturer();
        dto.model = vehicle.getModel();
        dto.yearManufactured = vehicle.getYearManufactured();
        dto.totalHours = vehicle.getTotalHours();
        dto.totalKilometers = vehicle.getTotalKilometers();
        dto.lastMaintenance = vehicle.getLastMaintenance();
        dto.nextMaintenanceHours = vehicle.getNextMaintenanceHours();
        dto.nextMaintenanceKm = vehicle.getNextMaintenanceKm();
        dto.status = vehicle.getStatus();
        dto.notes = vehicle.getNotes();
        dto.active = vehicle.getActive();
        dto.needsMaintenance = vehicle.needsMaintenance();
        dto.teamId = vehicle.getTeam() != null ? vehicle.getTeam().getId() : null;
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public VehicleType getVehicleType() { return vehicleType; }
    public void setVehicleType(VehicleType vehicleType) { this.vehicleType = vehicleType; }
    public VehicleCategory getCategory() { return category; }
    public void setCategory(VehicleCategory category) { this.category = category; }
    public String getChassisNumber() { return chassisNumber; }
    public void setChassisNumber(String chassisNumber) { this.chassisNumber = chassisNumber; }
    public String getEngineNumber() { return engineNumber; }
    public void setEngineNumber(String engineNumber) { this.engineNumber = engineNumber; }
    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
    public String getManufacturer() { return manufacturer; }
    public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public Integer getYearManufactured() { return yearManufactured; }
    public void setYearManufactured(Integer yearManufactured) { this.yearManufactured = yearManufactured; }
    public BigDecimal getTotalHours() { return totalHours; }
    public void setTotalHours(BigDecimal totalHours) { this.totalHours = totalHours; }
    public BigDecimal getTotalKilometers() { return totalKilometers; }
    public void setTotalKilometers(BigDecimal totalKilometers) { this.totalKilometers = totalKilometers; }
    public LocalDateTime getLastMaintenance() { return lastMaintenance; }
    public void setLastMaintenance(LocalDateTime lastMaintenance) { this.lastMaintenance = lastMaintenance; }
    public BigDecimal getNextMaintenanceHours() { return nextMaintenanceHours; }
    public void setNextMaintenanceHours(BigDecimal nextMaintenanceHours) { this.nextMaintenanceHours = nextMaintenanceHours; }
    public BigDecimal getNextMaintenanceKm() { return nextMaintenanceKm; }
    public void setNextMaintenanceKm(BigDecimal nextMaintenanceKm) { this.nextMaintenanceKm = nextMaintenanceKm; }
    public VehicleStatus getStatus() { return status; }
    public void setStatus(VehicleStatus status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public Boolean getNeedsMaintenance() { return needsMaintenance; }
    public void setNeedsMaintenance(Boolean needsMaintenance) { this.needsMaintenance = needsMaintenance; }
    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }
}
