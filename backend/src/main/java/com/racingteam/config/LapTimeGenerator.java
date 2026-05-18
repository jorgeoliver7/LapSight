package com.racingteam.config;

import com.racingteam.model.LapTime;
import com.racingteam.model.TireCompound;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Genera tiempos por vuelta plausibles para datos demo.
 *
 * Modelo:
 *   - Vuelta 1 (out lap): bestLapMs + outLapPenalty (típico +5-7s)
 *   - Vuelta 2-3: cerca del best (calentando neumáticos)
 *   - Vueltas siguientes: bestLapMs + (lap - 2) * degradationMs + jitter gaussiano
 *   - Si hay compound switch: nuevo stint reseteando degradación pero con tiempo
 *     inicial proporcional al compound (ej. HARD más lento que SOFT)
 *
 * Los sectores se generan dividiendo proporcionalmente el lap time y aplicando
 * jitter por sector para que el "theoretical best" sea < best lap real.
 */
public final class LapTimeGenerator {

    private LapTimeGenerator() {}

    public record StintSpec(
            int laps,
            long bestLapMs,
            double degradationMsPerLap,
            TireCompound compound
    ) {}

    public static List<LapTime> generate(List<StintSpec> stints, long randomSeed) {
        Random rng = new Random(randomSeed);
        List<LapTime> result = new ArrayList<>();
        int lapNumber = 1;
        boolean firstStint = true;

        for (StintSpec stint : stints) {
            for (int i = 0; i < stint.laps(); i++) {
                long lapTime;
                if (firstStint && i == 0) {
                    // Out lap del primer stint: penalización mayor (neumáticos fríos)
                    lapTime = stint.bestLapMs() + 5000 + (long) (rng.nextGaussian() * 800);
                } else if (i == 0) {
                    // Out lap tras pit stop: penalización menor
                    lapTime = stint.bestLapMs() + 2000 + (long) (rng.nextGaussian() * 400);
                } else if (i == 1) {
                    // Push lap inmediata tras out: cerca del best
                    lapTime = stint.bestLapMs() + 100 + (long) Math.abs(rng.nextGaussian() * 200);
                } else {
                    // Stint normal: best + degradación lineal + jitter
                    long base = stint.bestLapMs() + (long) ((i - 1) * stint.degradationMsPerLap());
                    long jitter = (long) (rng.nextGaussian() * Math.max(150, stint.bestLapMs() * 0.001));
                    lapTime = base + jitter;
                }

                LapTime lap = new LapTime(lapNumber, Math.max(stint.bestLapMs() - 200, lapTime));
                long s1 = (long) (lap.getLapTimeMs() * (0.34 + rng.nextGaussian() * 0.005));
                long s2 = (long) (lap.getLapTimeMs() * (0.36 + rng.nextGaussian() * 0.005));
                long s3 = lap.getLapTimeMs() - s1 - s2;
                lap.setSector1Ms(s1);
                lap.setSector2Ms(s2);
                lap.setSector3Ms(Math.max(s3, lap.getLapTimeMs() / 4));
                lap.setValid(true);
                lap.setCompound(stint.compound());

                result.add(lap);
                lapNumber++;
            }
            firstStint = false;
        }

        return result;
    }
}
