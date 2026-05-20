package com.lapsight.dto;

import com.lapsight.model.LapTime;
import com.lapsight.model.TireCompound;

import java.math.BigDecimal;

public class LapTimeDto {

    private Long id;
    private Integer lapNumber;
    private Long lapTimeMs;
    private Long sector1Ms;
    private Long sector2Ms;
    private Long sector3Ms;
    private Boolean valid;
    private TireCompound compound;
    private BigDecimal fuelKg;
    private String notes;

    public static LapTimeDto fromEntity(LapTime lap) {
        LapTimeDto dto = new LapTimeDto();
        dto.id = lap.getId();
        dto.lapNumber = lap.getLapNumber();
        dto.lapTimeMs = lap.getLapTimeMs();
        dto.sector1Ms = lap.getSector1Ms();
        dto.sector2Ms = lap.getSector2Ms();
        dto.sector3Ms = lap.getSector3Ms();
        dto.valid = lap.getValid();
        dto.compound = lap.getCompound();
        dto.fuelKg = lap.getFuelKg();
        dto.notes = lap.getNotes();
        return dto;
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
}
