package com.racingteam.dto;

import com.racingteam.model.VehicleStatus;
import com.racingteam.model.VehicleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class VehicleRequest {

    @NotBlank(message = "El nombre del vehículo es obligatorio")
    @Size(max = 100)
    private String name;

    @NotNull(message = "El tipo de vehículo es obligatorio")
    private VehicleType vehicleType;

    private String chassisNumber;
    private String engineNumber;
    private String registrationNumber;
    private String manufacturer;
    private String model;
    private Integer yearManufactured;

    @PositiveOrZero
    private BigDecimal totalHours;

    @PositiveOrZero
    private BigDecimal totalKilometers;

    private BigDecimal nextMaintenanceHours;
    private BigDecimal nextMaintenanceKm;
    private VehicleStatus status;
    private String notes;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public VehicleType getVehicleType() { return vehicleType; }
    public void setVehicleType(VehicleType vehicleType) { this.vehicleType = vehicleType; }
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
    public BigDecimal getNextMaintenanceHours() { return nextMaintenanceHours; }
    public void setNextMaintenanceHours(BigDecimal nextMaintenanceHours) { this.nextMaintenanceHours = nextMaintenanceHours; }
    public BigDecimal getNextMaintenanceKm() { return nextMaintenanceKm; }
    public void setNextMaintenanceKm(BigDecimal nextMaintenanceKm) { this.nextMaintenanceKm = nextMaintenanceKm; }
    public VehicleStatus getStatus() { return status; }
    public void setStatus(VehicleStatus status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
