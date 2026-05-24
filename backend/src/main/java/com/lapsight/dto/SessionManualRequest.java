package com.lapsight.dto;

import com.lapsight.model.SessionType;
import com.lapsight.model.TrackCondition;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class SessionManualRequest {

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
    private BigDecimal trackTempC;
    private BigDecimal ambientTempC;
    @Min(0)
    @Max(100)
    private Integer humidityPct;
    private BigDecimal windKph;
    private String setupNotes;
    private Long vehicleId;
    private Long driverId;

    @Valid
    @NotEmpty(message = "You must add at least one lap")
    private List<LapInputDto> laps;

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
    public List<LapInputDto> getLaps() { return laps; }
    public void setLaps(List<LapInputDto> laps) { this.laps = laps; }
    public BigDecimal getTrackTempC() { return trackTempC; }
    public void setTrackTempC(BigDecimal trackTempC) { this.trackTempC = trackTempC; }
    public BigDecimal getAmbientTempC() { return ambientTempC; }
    public void setAmbientTempC(BigDecimal ambientTempC) { this.ambientTempC = ambientTempC; }
    public Integer getHumidityPct() { return humidityPct; }
    public void setHumidityPct(Integer humidityPct) { this.humidityPct = humidityPct; }
    public BigDecimal getWindKph() { return windKph; }
    public void setWindKph(BigDecimal windKph) { this.windKph = windKph; }
    public String getSetupNotes() { return setupNotes; }
    public void setSetupNotes(String setupNotes) { this.setupNotes = setupNotes; }
}
