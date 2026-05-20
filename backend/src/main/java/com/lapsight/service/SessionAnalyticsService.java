package com.lapsight.service;

import com.lapsight.dto.SessionAnalyticsDto;
import com.lapsight.dto.SessionAnalyticsDto.LapAnalyticsDto;
import com.lapsight.model.LapTime;
import com.lapsight.model.Session;
import com.lapsight.repository.SessionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Cálculos analíticos sobre una sesión.
 *
 * Todos los agregados se calculan SOLO sobre vueltas válidas (LapTime.valid = true)
 * para no contaminar las medias con vueltas de pit/sale. La lista perLap se devuelve
 * completa (incluso inválidas) marcándolas explícitamente para que el frontend las
 * pinte distinto.
 *
 * Outlier: vuelta válida cuya lapTime > mediana × 1.07. Es la heurística estándar
 * "pit lap rule of thumb" en análisis amateur — para detectar vueltas anómalas que
 * el usuario no marcó como inválidas (salida de boxes, bandera amarilla, etc.).
 */
@Service
public class SessionAnalyticsService {

    private static final double OUTLIER_MULTIPLIER = 1.07;

    private final SessionRepository sessionRepository;

    public SessionAnalyticsService(SessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    @Transactional(readOnly = true)
    public SessionAnalyticsDto compute(Long sessionId, Long teamId) {
        Session session = sessionRepository.findByIdAndTeamId(sessionId, teamId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Sesión " + sessionId + " no encontrada en el equipo " + teamId));

        SessionAnalyticsDto dto = new SessionAnalyticsDto();
        dto.setSessionId(session.getId());
        dto.setSessionName(session.getName());

        List<LapTime> allLaps = new ArrayList<>(session.getLaps());
        allLaps.sort(Comparator.comparingInt(LapTime::getLapNumber));

        List<LapTime> validLaps = allLaps.stream().filter(LapTime::getValid).toList();

        dto.setTotalLaps(allLaps.size());
        dto.setValidLaps(validLaps.size());
        dto.setInvalidLaps(allLaps.size() - validLaps.size());

        if (validLaps.isEmpty()) {
            dto.setPerLap(allLaps.stream().map(this::baseLapDto).toList());
            return dto;
        }

        LapTime best = validLaps.stream()
                .min(Comparator.comparingLong(LapTime::getLapTimeMs))
                .orElseThrow();
        dto.setBestLapMs(best.getLapTimeMs());
        dto.setBestLapNumber(best.getLapNumber());

        LapTime worst = validLaps.stream()
                .max(Comparator.comparingLong(LapTime::getLapTimeMs))
                .orElseThrow();
        dto.setWorstLapMs(worst.getLapTimeMs());

        long[] validTimes = validLaps.stream().mapToLong(LapTime::getLapTimeMs).toArray();
        dto.setAverageMs((long) mean(validTimes));
        dto.setMedianMs(median(validTimes));
        dto.setStdDevMs((long) stdDev(validTimes, mean(validTimes)));

        dto.setBestSector1Ms(minNonNull(validLaps, LapTime::getSector1Ms));
        dto.setBestSector2Ms(minNonNull(validLaps, LapTime::getSector2Ms));
        dto.setBestSector3Ms(minNonNull(validLaps, LapTime::getSector3Ms));
        if (dto.getBestSector1Ms() != null
                && dto.getBestSector2Ms() != null
                && dto.getBestSector3Ms() != null) {
            dto.setTheoreticalBestLapMs(
                    dto.getBestSector1Ms() + dto.getBestSector2Ms() + dto.getBestSector3Ms());
        }

        double[] regression = linearRegression(validLaps);
        if (regression != null) {
            dto.setDegradationMsPerLap(regression[0]);
            dto.setDegradationR2(regression[1]);
        }

        double median = dto.getMedianMs();
        double outlierThreshold = median * OUTLIER_MULTIPLIER;

        List<LapAnalyticsDto> perLap = new ArrayList<>(allLaps.size());
        for (LapTime lap : allLaps) {
            LapAnalyticsDto lDto = baseLapDto(lap);
            lDto.setGapToBestMs(lap.getLapTimeMs() - best.getLapTimeMs());
            lDto.setOutlier(lap.getValid() && lap.getLapTimeMs() > outlierThreshold);
            perLap.add(lDto);
        }
        dto.setPerLap(perLap);

        return dto;
    }

    private LapAnalyticsDto baseLapDto(LapTime lap) {
        LapAnalyticsDto l = new LapAnalyticsDto();
        l.setLapNumber(lap.getLapNumber());
        l.setLapTimeMs(lap.getLapTimeMs());
        l.setSector1Ms(lap.getSector1Ms());
        l.setSector2Ms(lap.getSector2Ms());
        l.setSector3Ms(lap.getSector3Ms());
        l.setValid(lap.getValid());
        l.setOutlier(false);
        l.setCompound(lap.getCompound() != null ? lap.getCompound().name() : null);
        return l;
    }

    private Long minNonNull(List<LapTime> laps, java.util.function.Function<LapTime, Long> getter) {
        return laps.stream()
                .map(getter)
                .filter(v -> v != null && v > 0)
                .min(Long::compareTo)
                .orElse(null);
    }

    private double mean(long[] values) {
        long sum = 0;
        for (long v : values) sum += v;
        return (double) sum / values.length;
    }

    private long median(long[] values) {
        long[] sorted = values.clone();
        java.util.Arrays.sort(sorted);
        int n = sorted.length;
        if (n % 2 == 1) return sorted[n / 2];
        return (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    }

    private double stdDev(long[] values, double mean) {
        double sumSq = 0;
        for (long v : values) {
            double diff = v - mean;
            sumSq += diff * diff;
        }
        return Math.sqrt(sumSq / values.length);
    }

    /**
     * Ajuste lineal lapTimeMs = a + b·lapNumber.
     * @return [slope=ms perdidos por vuelta, R²]. null si < 2 vueltas válidas.
     */
    private double[] linearRegression(List<LapTime> laps) {
        int n = laps.size();
        if (n < 2) return null;

        double sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (LapTime lap : laps) {
            double x = lap.getLapNumber();
            double y = lap.getLapTimeMs();
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumXX += x * x;
        }

        double denom = n * sumXX - sumX * sumX;
        if (denom == 0) return null;

        double slope = (n * sumXY - sumX * sumY) / denom;
        double intercept = (sumY - slope * sumX) / n;

        double ssTot = 0, ssRes = 0;
        double meanY = sumY / n;
        for (LapTime lap : laps) {
            double y = lap.getLapTimeMs();
            double yPred = intercept + slope * lap.getLapNumber();
            ssTot += (y - meanY) * (y - meanY);
            ssRes += (y - yPred) * (y - yPred);
        }
        double r2 = ssTot == 0 ? 1.0 : 1.0 - (ssRes / ssTot);

        return new double[]{slope, r2};
    }
}
