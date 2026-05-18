package com.racingteam.dto;

import com.racingteam.model.SessionType;
import com.racingteam.model.TrackCondition;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class SessionRequest {

    @NotBlank
    @Size(max = 150)
    private String name;

    @Size(max = 150)
    private String circuit;

    @NotNull
    private LocalDateTime sessionDate;

    @NotNull
    private SessionType sessionType;

    private TrackCondition trackCondition;
    private Integer durationMinutes;
    private String notes;

    private Long vehicleId;
    private Long driverId;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCircuit() { return circuit; }
    public void setCircuit(String circuit) { this.circuit = circuit; }
    public LocalDateTime getSessionDate() { return sessionDate; }
    public void setSessionDate(LocalDateTime sessionDate) { this.sessionDate = sessionDate; }
    public SessionType getSessionType() { return sessionType; }
    public void setSessionType(SessionType sessionType) { this.sessionType = sessionType; }
    public TrackCondition getTrackCondition() { return trackCondition; }
    public void setTrackCondition(TrackCondition trackCondition) { this.trackCondition = trackCondition; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
    public Long getDriverId() { return driverId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }
}
