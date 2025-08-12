package com.racingteam.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_records")
@EntityListeners(AuditingEntityListener.class)
public class MaintenanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "La fecha de mantenimiento es obligatoria")
    @Column(name = "maintenance_date", nullable = false)
    private LocalDateTime maintenanceDate;

    @NotBlank(message = "La descripción es obligatoria")
    @Size(max = 500, message = "La descripción no puede exceder 500 caracteres")
    @Column(nullable = false, length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "maintenance_type", nullable = false)
    private MaintenanceType maintenanceType;

    @PositiveOrZero(message = "Las horas del vehículo no pueden ser negativas")
    @Column(name = "vehicle_hours_at_maintenance", precision = 10, scale = 2)
    private BigDecimal vehicleHoursAtMaintenance;

    @PositiveOrZero(message = "Los kilómetros del vehículo no pueden ser negativos")
    @Column(name = "vehicle_km_at_maintenance", precision = 10, scale = 2)
    private BigDecimal vehicleKmAtMaintenance;

    @PositiveOrZero(message = "El coste no puede ser negativo")
    @Column(name = "cost", precision = 10, scale = 2)
    private BigDecimal cost;

    @Column(name = "parts_replaced", length = 1000)
    private String partsReplaced;

    @Column(name = "next_maintenance_hours", precision = 10, scale = 2)
    private BigDecimal nextMaintenanceHours;

    @Column(name = "next_maintenance_km", precision = 10, scale = 2)
    private BigDecimal nextMaintenanceKm;

    @Column(name = "notes", length = 1000)
    private String notes;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relaciones
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by_user_id")
    private User performedBy;

    // Constructores
    public MaintenanceRecord() {}

    public MaintenanceRecord(LocalDateTime maintenanceDate, String description, MaintenanceType maintenanceType) {
        this.maintenanceDate = maintenanceDate;
        this.description = description;
        this.maintenanceType = maintenanceType;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getMaintenanceDate() {
        return maintenanceDate;
    }

    public void setMaintenanceDate(LocalDateTime maintenanceDate) {
        this.maintenanceDate = maintenanceDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public MaintenanceType getMaintenanceType() {
        return maintenanceType;
    }

    public void setMaintenanceType(MaintenanceType maintenanceType) {
        this.maintenanceType = maintenanceType;
    }

    public BigDecimal getVehicleHoursAtMaintenance() {
        return vehicleHoursAtMaintenance;
    }

    public void setVehicleHoursAtMaintenance(BigDecimal vehicleHoursAtMaintenance) {
        this.vehicleHoursAtMaintenance = vehicleHoursAtMaintenance;
    }

    public BigDecimal getVehicleKmAtMaintenance() {
        return vehicleKmAtMaintenance;
    }

    public void setVehicleKmAtMaintenance(BigDecimal vehicleKmAtMaintenance) {
        this.vehicleKmAtMaintenance = vehicleKmAtMaintenance;
    }

    public BigDecimal getCost() {
        return cost;
    }

    public void setCost(BigDecimal cost) {
        this.cost = cost;
    }

    public String getPartsReplaced() {
        return partsReplaced;
    }

    public void setPartsReplaced(String partsReplaced) {
        this.partsReplaced = partsReplaced;
    }

    public BigDecimal getNextMaintenanceHours() {
        return nextMaintenanceHours;
    }

    public void setNextMaintenanceHours(BigDecimal nextMaintenanceHours) {
        this.nextMaintenanceHours = nextMaintenanceHours;
    }

    public BigDecimal getNextMaintenanceKm() {
        return nextMaintenanceKm;
    }

    public void setNextMaintenanceKm(BigDecimal nextMaintenanceKm) {
        this.nextMaintenanceKm = nextMaintenanceKm;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Vehicle getVehicle() {
        return vehicle;
    }

    public void setVehicle(Vehicle vehicle) {
        this.vehicle = vehicle;
    }

    public User getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(User performedBy) {
        this.performedBy = performedBy;
    }
}