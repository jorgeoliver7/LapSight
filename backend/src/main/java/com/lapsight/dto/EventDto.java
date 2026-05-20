package com.lapsight.dto;

import com.lapsight.model.Event;
import com.lapsight.model.EventStatus;
import com.lapsight.model.EventType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class EventDto {

    private Long id;
    private String name;
    private String description;
    private EventType eventType;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String location;
    private String circuitName;
    private EventStatus status;
    private String notes;
    private BigDecimal budgetAllocated;
    private BigDecimal actualCost;
    private Long teamId;
    private List<ParticipantDto> participants;
    private List<VehicleSummaryDto> vehicles;

    public static EventDto fromEntity(Event event) {
        EventDto dto = new EventDto();
        dto.id = event.getId();
        dto.name = event.getName();
        dto.description = event.getDescription();
        dto.eventType = event.getEventType();
        dto.startDate = event.getStartDate();
        dto.endDate = event.getEndDate();
        dto.location = event.getLocation();
        dto.circuitName = event.getCircuitName();
        dto.status = event.getStatus();
        dto.notes = event.getNotes();
        dto.budgetAllocated = event.getBudgetAllocated();
        dto.actualCost = event.getActualCost();
        dto.teamId = event.getTeam() != null ? event.getTeam().getId() : null;
        dto.participants = event.getParticipants() != null
                ? event.getParticipants().stream().map(ParticipantDto::fromUser).toList()
                : List.of();
        dto.vehicles = event.getVehicles() != null
                ? event.getVehicles().stream().map(VehicleSummaryDto::fromVehicle).toList()
                : List.of();
        return dto;
    }

    public record ParticipantDto(Long id, String fullName, String role) {
        public static ParticipantDto fromUser(com.lapsight.model.User user) {
            return new ParticipantDto(
                    user.getId(),
                    user.getFullName(),
                    user.getRole() != null ? user.getRole().name() : null
            );
        }
    }

    public record VehicleSummaryDto(Long id, String name, String vehicleType) {
        public static VehicleSummaryDto fromVehicle(com.lapsight.model.Vehicle v) {
            return new VehicleSummaryDto(
                    v.getId(),
                    v.getName(),
                    v.getVehicleType() != null ? v.getVehicleType().name() : null
            );
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public EventType getEventType() { return eventType; }
    public void setEventType(EventType eventType) { this.eventType = eventType; }
    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getCircuitName() { return circuitName; }
    public void setCircuitName(String circuitName) { this.circuitName = circuitName; }
    public EventStatus getStatus() { return status; }
    public void setStatus(EventStatus status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public BigDecimal getBudgetAllocated() { return budgetAllocated; }
    public void setBudgetAllocated(BigDecimal budgetAllocated) { this.budgetAllocated = budgetAllocated; }
    public BigDecimal getActualCost() { return actualCost; }
    public void setActualCost(BigDecimal actualCost) { this.actualCost = actualCost; }
    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }
    public List<ParticipantDto> getParticipants() { return participants; }
    public void setParticipants(List<ParticipantDto> participants) { this.participants = participants; }
    public List<VehicleSummaryDto> getVehicles() { return vehicles; }
    public void setVehicles(List<VehicleSummaryDto> vehicles) { this.vehicles = vehicles; }
}
