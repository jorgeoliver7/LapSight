package com.racingteam.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@Entity
@Table(name = "lap_times", indexes = {
        @Index(name = "idx_lap_session", columnList = "session_id"),
        @Index(name = "idx_lap_session_number", columnList = "session_id, lap_number")
})
public class LapTime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Min(1)
    @Column(name = "lap_number", nullable = false)
    private Integer lapNumber;

    @NotNull
    @Min(1)
    @Column(name = "lap_time_ms", nullable = false)
    private Long lapTimeMs;

    @Column(name = "sector_1_ms")
    private Long sector1Ms;

    @Column(name = "sector_2_ms")
    private Long sector2Ms;

    @Column(name = "sector_3_ms")
    private Long sector3Ms;

    @Column(nullable = false)
    private Boolean valid = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "compound")
    private TireCompound compound;

    @Column(name = "fuel_kg", precision = 6, scale = 2)
    private BigDecimal fuelKg;

    @Column(length = 500)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    public LapTime() {}

    public LapTime(Integer lapNumber, Long lapTimeMs) {
        this.lapNumber = lapNumber;
        this.lapTimeMs = lapTimeMs;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getLapNumber() { return lapNumber; }
    public void setLapNumber(Integer lapNumber) { this.lapNumber = lapNumber; }
    public Long getLapTimeMs() { return lapTimeMs; }
    public void setLapTimeMs(Long lapTimeMs) { this.lapTimeMs = lapTimeMs; }
    public Long getSector1Ms() { return sector1Ms; }
    public void setSector1Ms(Long sector1Ms) { this.sector1Ms = sector1Ms; }
    public Long getSector2Ms() { return sector2Ms; }
    public void setSector2Ms(Long sector2Ms) { this.sector2Ms = sector2Ms; }
    public Long getSector3Ms() { return sector3Ms; }
    public void setSector3Ms(Long sector3Ms) { this.sector3Ms = sector3Ms; }
    public Boolean getValid() { return valid; }
    public void setValid(Boolean valid) { this.valid = valid; }
    public TireCompound getCompound() { return compound; }
    public void setCompound(TireCompound compound) { this.compound = compound; }
    public BigDecimal getFuelKg() { return fuelKg; }
    public void setFuelKg(BigDecimal fuelKg) { this.fuelKg = fuelKg; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Session getSession() { return session; }
    public void setSession(Session session) { this.session = session; }
}
