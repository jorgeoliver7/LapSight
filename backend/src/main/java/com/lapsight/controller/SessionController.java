package com.lapsight.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lapsight.dto.SessionAnalyticsDto;
import com.lapsight.dto.SessionDto;
import com.lapsight.dto.SessionManualRequest;
import com.lapsight.dto.SessionRequest;
import com.lapsight.dto.analytics.AnalyticsLapDto;
import com.lapsight.dto.analytics.AnomaliesResponseDto;
import com.lapsight.dto.analytics.DegradationResponseDto;
import com.lapsight.dto.analytics.HeatmapResponseDto;
import com.lapsight.dto.analytics.StintsResponseDto;
import com.lapsight.model.Session;
import com.lapsight.model.User;
import com.lapsight.repository.SessionRepository;
import com.lapsight.service.PythonAnalyticsClient;
import com.lapsight.service.SessionAnalyticsService;
import com.lapsight.service.SessionService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.Validator;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/sessions")
public class SessionController {

    private final SessionService sessionService;
    private final SessionAnalyticsService analyticsService;
    private final PythonAnalyticsClient pythonAnalytics;
    private final SessionRepository sessionRepository;
    private final ObjectMapper objectMapper;
    private final Validator validator;

    public SessionController(SessionService sessionService,
                             SessionAnalyticsService analyticsService,
                             PythonAnalyticsClient pythonAnalytics,
                             SessionRepository sessionRepository,
                             ObjectMapper objectMapper,
                             Validator validator) {
        this.sessionService = sessionService;
        this.analyticsService = analyticsService;
        this.pythonAnalytics = pythonAnalytics;
        this.sessionRepository = sessionRepository;
        this.objectMapper = objectMapper;
        this.validator = validator;
    }

    private List<AnalyticsLapDto> getLapsForAdvancedAnalytics(Long id, User user) {
        Session session = sessionRepository.findByIdAndTeamId(id, user.getTeam().getId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Session " + id + " not found in team"));
        return session.getLaps().stream().map(AnalyticsLapDto::fromEntity).toList();
    }

    @GetMapping
    public ResponseEntity<List<SessionDto>> list(@AuthenticationPrincipal User current) {
        return ResponseEntity.ok(sessionService.findAllByTeam(current.getTeam().getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionDto> get(@PathVariable Long id, @AuthenticationPrincipal User current) {
        return ResponseEntity.ok(sessionService.findByIdInTeam(id, current.getTeam().getId()));
    }

    @GetMapping("/{id}/analytics")
    public ResponseEntity<SessionAnalyticsDto> analytics(@PathVariable Long id,
                                                         @AuthenticationPrincipal User current) {
        return ResponseEntity.ok(analyticsService.compute(id, current.getTeam().getId()));
    }

    @GetMapping("/{id}/analytics/stints")
    public ResponseEntity<StintsResponseDto> stints(@PathVariable Long id,
                                                    @AuthenticationPrincipal User current) {
        return ResponseEntity.ok(pythonAnalytics.stints(getLapsForAdvancedAnalytics(id, current)));
    }

    @GetMapping("/{id}/analytics/anomalies")
    public ResponseEntity<AnomaliesResponseDto> anomalies(@PathVariable Long id,
                                                          @AuthenticationPrincipal User current) {
        return ResponseEntity.ok(pythonAnalytics.anomalies(getLapsForAdvancedAnalytics(id, current)));
    }

    @GetMapping("/{id}/analytics/degradation")
    public ResponseEntity<DegradationResponseDto> degradationAdvanced(@PathVariable Long id,
                                                                      @AuthenticationPrincipal User current) {
        return ResponseEntity.ok(pythonAnalytics.degradation(getLapsForAdvancedAnalytics(id, current)));
    }

    @GetMapping("/{id}/analytics/heatmap")
    public ResponseEntity<HeatmapResponseDto> heatmap(@PathVariable Long id,
                                                      @AuthenticationPrincipal User current) {
        return ResponseEntity.ok(pythonAnalytics.heatmap(getLapsForAdvancedAnalytics(id, current)));
    }

    @GetMapping("/{id}/analytics/insights")
    public ResponseEntity<com.lapsight.dto.analytics.InsightsResponseDto> insights(
            @PathVariable Long id,
            @AuthenticationPrincipal User current) {
        return ResponseEntity.ok(pythonAnalytics.insights(getLapsForAdvancedAnalytics(id, current)));
    }

    @GetMapping(value = "/{id}/report.pdf", produces = "application/pdf")
    public ResponseEntity<byte[]> reportPdf(@PathVariable Long id,
                                            @AuthenticationPrincipal User current) {
        Session session = sessionRepository.findByIdAndTeamId(id, current.getTeam().getId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Session " + id + " not found in team"));

        java.util.Map<String, Object> payload = new java.util.LinkedHashMap<>();
        payload.put("session_name", session.getName());
        payload.put("circuit", session.getCircuit());
        payload.put("session_date", session.getSessionDate() != null ? session.getSessionDate().toString() : null);
        payload.put("session_type", session.getSessionType() != null ? session.getSessionType().getDisplayName() : null);
        payload.put("track_condition", session.getTrackCondition() != null ? session.getTrackCondition().getDisplayName() : null);
        payload.put("duration_minutes", session.getDurationMinutes());
        payload.put("notes", session.getNotes());
        payload.put("driver_name", session.getDriver() != null ? session.getDriver().getFullName() : null);
        payload.put("vehicle_name", session.getVehicle() != null ? session.getVehicle().getName() : null);
        payload.put("team_name", session.getTeam() != null ? session.getTeam().getName() : null);
        payload.put("laps", session.getLaps().stream().map(AnalyticsLapDto::fromEntity).toList());

        byte[] pdf = pythonAnalytics.generatePdf(payload);
        String safeName = session.getName().replaceAll("[^a-zA-Z0-9-]", "_");
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"report-" + safeName + ".pdf\"")
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "application/pdf")
                .body(pdf);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('MANAGER', 'ENGINEER', 'PILOT')")
    public ResponseEntity<SessionDto> upload(
            @RequestPart("metadata") String metadataJson,
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal User current
    ) throws IOException {
        SessionRequest request = objectMapper.readValue(metadataJson, SessionRequest.class);
        Set<jakarta.validation.ConstraintViolation<SessionRequest>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            throw new IllegalArgumentException(violations.stream()
                    .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                    .collect(Collectors.joining("; ")));
        }
        return ResponseEntity.ok(sessionService.create(current.getTeam().getId(), request, file));
    }

    @PostMapping(value = "/manual", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('MANAGER', 'ENGINEER', 'PILOT')")
    public ResponseEntity<SessionDto> createManual(@Valid @RequestBody SessionManualRequest request,
                                                   @AuthenticationPrincipal User current) {
        return ResponseEntity.ok(sessionService.createManual(current.getTeam().getId(), request));
    }

    @GetMapping("/template")
    public ResponseEntity<String> downloadTemplate() {
        String csv = """
                # Lap times template for LapSight
                # Edit this file with your data and upload it on the "Upload CSV" tab.
                # Recognized columns (in any order):
                #   lap        Lap number (1, 2, 3...)
                #   time       Lap time. Formats: 1:23.456 / 83.456 / 83456 (ms)
                #   s1, s2, s3 Sector times (optional, same format)
                #   valid      true/false (optional, defaults to true)
                #   compound   SOFT / MEDIUM / HARD / INTERMEDIATE / WET (optional)
                #   fuel       Fuel in kg (optional)
                #   notes      Free-form notes (optional)
                #
                # Supported separators: comma or semicolon.
                # Lines starting with # are ignored.
                lap,time,s1,s2,s3,valid,compound,fuel,notes
                1,1:24.512,28.123,32.001,24.388,true,SOFT,40.5,Out lap
                2,1:19.234,26.011,29.541,23.682,true,SOFT,39.8,
                3,1:18.456,25.872,29.103,23.481,true,SOFT,39.1,
                4,1:18.221,25.711,29.042,23.468,true,SOFT,38.4,Best lap
                5,1:18.345,25.789,29.077,23.479,true,SOFT,37.7,
                """;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=utf-8"));
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"lap-times-template.csv\"");
        return ResponseEntity.ok().headers(headers).body(csv);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ENGINEER')")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal User current) {
        sessionService.delete(id, current.getTeam().getId());
        return ResponseEntity.noContent().build();
    }
}
