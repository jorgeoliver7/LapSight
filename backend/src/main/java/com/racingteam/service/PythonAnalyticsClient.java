package com.racingteam.service;

import com.racingteam.dto.analytics.AnalyticsLapDto;
import com.racingteam.dto.analytics.AnomaliesResponseDto;
import com.racingteam.dto.analytics.DegradationResponseDto;
import com.racingteam.dto.analytics.HeatmapResponseDto;
import com.racingteam.dto.analytics.StintsResponseDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Cliente HTTP hacia el microservicio Python de analytics.
 *
 * Si el microservicio no responde, lanza RuntimeException — el caller decide qué
 * hacer (fallback a stats Java básicas, devolver 503, etc.). No hace retry interno
 * a propósito: prefiero que el fallo sea inmediato para detectar problemas pronto.
 */
@Service
public class PythonAnalyticsClient {

    private static final Logger log = LoggerFactory.getLogger(PythonAnalyticsClient.class);

    private final RestClient client;

    public PythonAnalyticsClient(
            @Value("${app.analytics.python-url}") String baseUrl,
            @Value("${app.analytics.timeout-ms}") long timeoutMs
    ) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) Math.min(timeoutMs, Integer.MAX_VALUE));
        factory.setReadTimeout((int) Math.min(timeoutMs, Integer.MAX_VALUE));
        this.client = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .build();
        log.info("Python analytics client → {} (timeout {}ms)", baseUrl, timeoutMs);
    }

    public StintsResponseDto stints(List<AnalyticsLapDto> laps) {
        return post("/analyze/stints", laps, StintsResponseDto.class);
    }

    public AnomaliesResponseDto anomalies(List<AnalyticsLapDto> laps) {
        return post("/analyze/anomalies", laps, AnomaliesResponseDto.class);
    }

    public DegradationResponseDto degradation(List<AnalyticsLapDto> laps) {
        return post("/analyze/degradation", laps, DegradationResponseDto.class);
    }

    public HeatmapResponseDto heatmap(List<AnalyticsLapDto> laps) {
        return post("/analyze/heatmap", laps, HeatmapResponseDto.class);
    }

    private <T> T post(String path, List<AnalyticsLapDto> laps, Class<T> responseType) {
        try {
            return client.post()
                    .uri(path)
                    .body(Map.of("laps", laps))
                    .retrieve()
                    .body(responseType);
        } catch (RestClientException e) {
            log.warn("Python analytics call to {} failed: {}", path, e.getMessage());
            throw new RuntimeException("Analytics service unavailable: " + e.getMessage(), e);
        }
    }
}
