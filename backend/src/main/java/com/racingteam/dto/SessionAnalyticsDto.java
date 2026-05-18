package com.racingteam.dto;

import java.util.List;

public class SessionAnalyticsDto {

    private Long sessionId;
    private String sessionName;

    private int totalLaps;
    private int validLaps;
    private int invalidLaps;

    private Long bestLapMs;
    private Integer bestLapNumber;
    private Long worstLapMs;
    private Long averageMs;
    private Long medianMs;
    private Long stdDevMs;

    private Long bestSector1Ms;
    private Long bestSector2Ms;
    private Long bestSector3Ms;
    private Long theoreticalBestLapMs;

    /** Pendiente de la regresión lineal: ms ganados/perdidos por vuelta. */
    private Double degradationMsPerLap;

    /** R² del ajuste lineal (0..1). */
    private Double degradationR2;

    private List<LapAnalyticsDto> perLap;

    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }
    public String getSessionName() { return sessionName; }
    public void setSessionName(String sessionName) { this.sessionName = sessionName; }
    public int getTotalLaps() { return totalLaps; }
    public void setTotalLaps(int totalLaps) { this.totalLaps = totalLaps; }
    public int getValidLaps() { return validLaps; }
    public void setValidLaps(int validLaps) { this.validLaps = validLaps; }
    public int getInvalidLaps() { return invalidLaps; }
    public void setInvalidLaps(int invalidLaps) { this.invalidLaps = invalidLaps; }
    public Long getBestLapMs() { return bestLapMs; }
    public void setBestLapMs(Long bestLapMs) { this.bestLapMs = bestLapMs; }
    public Integer getBestLapNumber() { return bestLapNumber; }
    public void setBestLapNumber(Integer bestLapNumber) { this.bestLapNumber = bestLapNumber; }
    public Long getWorstLapMs() { return worstLapMs; }
    public void setWorstLapMs(Long worstLapMs) { this.worstLapMs = worstLapMs; }
    public Long getAverageMs() { return averageMs; }
    public void setAverageMs(Long averageMs) { this.averageMs = averageMs; }
    public Long getMedianMs() { return medianMs; }
    public void setMedianMs(Long medianMs) { this.medianMs = medianMs; }
    public Long getStdDevMs() { return stdDevMs; }
    public void setStdDevMs(Long stdDevMs) { this.stdDevMs = stdDevMs; }
    public Long getBestSector1Ms() { return bestSector1Ms; }
    public void setBestSector1Ms(Long bestSector1Ms) { this.bestSector1Ms = bestSector1Ms; }
    public Long getBestSector2Ms() { return bestSector2Ms; }
    public void setBestSector2Ms(Long bestSector2Ms) { this.bestSector2Ms = bestSector2Ms; }
    public Long getBestSector3Ms() { return bestSector3Ms; }
    public void setBestSector3Ms(Long bestSector3Ms) { this.bestSector3Ms = bestSector3Ms; }
    public Long getTheoreticalBestLapMs() { return theoreticalBestLapMs; }
    public void setTheoreticalBestLapMs(Long theoreticalBestLapMs) { this.theoreticalBestLapMs = theoreticalBestLapMs; }
    public Double getDegradationMsPerLap() { return degradationMsPerLap; }
    public void setDegradationMsPerLap(Double degradationMsPerLap) { this.degradationMsPerLap = degradationMsPerLap; }
    public Double getDegradationR2() { return degradationR2; }
    public void setDegradationR2(Double degradationR2) { this.degradationR2 = degradationR2; }
    public List<LapAnalyticsDto> getPerLap() { return perLap; }
    public void setPerLap(List<LapAnalyticsDto> perLap) { this.perLap = perLap; }

    public static class LapAnalyticsDto {
        private Integer lapNumber;
        private Long lapTimeMs;
        private Long sector1Ms;
        private Long sector2Ms;
        private Long sector3Ms;
        private Long gapToBestMs;
        private Boolean valid;
        private Boolean outlier;
        private String compound;

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
        public Long getGapToBestMs() { return gapToBestMs; }
        public void setGapToBestMs(Long gapToBestMs) { this.gapToBestMs = gapToBestMs; }
        public Boolean getValid() { return valid; }
        public void setValid(Boolean valid) { this.valid = valid; }
        public Boolean getOutlier() { return outlier; }
        public void setOutlier(Boolean outlier) { this.outlier = outlier; }
        public String getCompound() { return compound; }
        public void setCompound(String compound) { this.compound = compound; }
    }
}
