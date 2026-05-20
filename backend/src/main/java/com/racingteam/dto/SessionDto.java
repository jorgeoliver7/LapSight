package com.racingteam.dto;

import com.racingteam.model.Session;
import com.racingteam.model.SessionType;
import com.racingteam.model.TrackCondition;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class SessionDto {

    private Long id;
    private String name;
    private String circuit;
    private LocalDateTime sessionDate;
    private SessionType sessionType;
    private TrackCondition trackCondition;
    private Integer durationMinutes;
    private String notes;

    private BigDecimal trackTempC;
    private BigDecimal ambientTempC;
    private Integer humidityPct;
    private BigDecimal windKph;
    private String setupNotes;

    private Long teamId;
    private Long vehicleId;
    private String vehicleName;
    private Long driverId;
    private String driverName;

    private Integer lapCount;
    private List<LapTimeDto> laps;

    public static SessionDto summary(Session session) {
        SessionDto dto = base(session);
        dto.lapCount = session.getLaps() != null ? session.getLaps().size() : 0;
        return dto;
    }

    public static SessionDto detail(Session session) {
        SessionDto dto = base(session);
        dto.laps = session.getLaps().stream().map(LapTimeDto::fromEntity).toList();
        dto.lapCount = dto.laps.size();
        return dto;
    }

    private static SessionDto base(Session s) {
        SessionDto dto = new SessionDto();
        dto.id = s.getId();
        dto.name = s.getName();
        dto.circuit = s.getCircuit();
        dto.sessionDate = s.getSessionDate();
        dto.sessionType = s.getSessionType();
        dto.trackCondition = s.getTrackCondition();
        dto.durationMinutes = s.getDurationMinutes();
        dto.notes = s.getNotes();
        dto.trackTempC = s.getTrackTempC();
        dto.ambientTempC = s.getAmbientTempC();
        dto.humidityPct = s.getHumidityPct();
        dto.windKph = s.getWindKph();
        dto.setupNotes = s.getSetupNotes();
        if (s.getTeam() != null) dto.teamId = s.getTeam().getId();
        if (s.getVehicle() != null) {
            dto.vehicleId = s.getVehicle().getId();
            dto.vehicleName = s.getVehicle().getName();
        }
        if (s.getDriver() != null) {
            dto.driverId = s.getDriver().getId();
            dto.driverName = s.getDriver().getFirstName() + " " + s.getDriver().getLastName();
        }
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }
    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
    public String getVehicleName() { return vehicleName; }
    public void setVehicleName(String vehicleName) { this.vehicleName = vehicleName; }
    public Long getDriverId() { return driverId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }
    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }
    public Integer getLapCount() { return lapCount; }
    public void setLapCount(Integer lapCount) { this.lapCount = lapCount; }
    public List<LapTimeDto> getLaps() { return laps; }
    public void setLaps(List<LapTimeDto> laps) { this.laps = laps; }
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
