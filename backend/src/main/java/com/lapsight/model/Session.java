package com.lapsight.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sessions")
@EntityListeners(AuditingEntityListener.class)
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 150)
    @Column(nullable = false, length = 150)
    private String name;

    @Size(max = 150)
    @Column(length = 150)
    private String circuit;

    @NotNull
    @Column(name = "session_date", nullable = false)
    private LocalDateTime sessionDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "session_type", nullable = false)
    private SessionType sessionType;

    @Enumerated(EnumType.STRING)
    @Column(name = "track_condition")
    private TrackCondition trackCondition;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "track_temp_c", precision = 4, scale = 1)
    private BigDecimal trackTempC;

    @Column(name = "ambient_temp_c", precision = 4, scale = 1)
    private BigDecimal ambientTempC;

    @Min(0)
    @Max(100)
    @Column(name = "humidity_pct")
    private Integer humidityPct;

    @Column(name = "wind_kph", precision = 5, scale = 1)
    private BigDecimal windKph;

    @Column(name = "setup_notes", columnDefinition = "TEXT")
    private String setupNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private User driver;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("lapNumber ASC")
    private List<LapTime> laps = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Session() {}

    public void addLap(LapTime lap) {
        lap.setSession(this);
        this.laps.add(lap);
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
    public Team getTeam() { return team; }
    public void setTeam(Team team) { this.team = team; }
    public Vehicle getVehicle() { return vehicle; }
    public void setVehicle(Vehicle vehicle) { this.vehicle = vehicle; }
    public User getDriver() { return driver; }
    public void setDriver(User driver) { this.driver = driver; }
    public List<LapTime> getLaps() { return laps; }
    public void setLaps(List<LapTime> laps) { this.laps = laps; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
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
