package com.lapsight.dto;

import com.lapsight.model.TireCompound;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

import java.math.BigDecimal;

/**
 * Vuelta enviada por el cliente al crear sesión manualmente.
 * Los tiempos vienen como strings para tolerar formatos "1:23.456", "83.456" o ms.
 */
public class LapInputDto {

    @NotNull
    @Min(1)
    private Integer lapNumber;

    @NotBlank
    private String lapTime;

    private String sector1;
    private String sector2;
    private String sector3;

    private Boolean valid;
    private TireCompound compound;
    private BigDecimal fuelKg;
    private String notes;

    public Integer getLapNumber() { return lapNumber; }
    public void setLapNumber(Integer lapNumber) { this.lapNumber = lapNumber; }
    public String getLapTime() { return lapTime; }
    public void setLapTime(String lapTime) { this.lapTime = lapTime; }
    public String getSector1() { return sector1; }
    public void setSector1(String sector1) { this.sector1 = sector1; }
    public String getSector2() { return sector2; }
    public void setSector2(String sector2) { this.sector2 = sector2; }
    public String getSector3() { return sector3; }
    public void setSector3(String sector3) { this.sector3 = sector3; }
    public Boolean getValid() { return valid; }
    public void setValid(Boolean valid) { this.valid = valid; }
    public TireCompound getCompound() { return compound; }
    public void setCompound(TireCompound compound) { this.compound = compound; }
    public BigDecimal getFuelKg() { return fuelKg; }
    public void setFuelKg(BigDecimal fuelKg) { this.fuelKg = fuelKg; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
