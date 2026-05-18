package com.racingteam.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.racingteam.dto.SessionAnalyticsDto;
import com.racingteam.dto.SessionDto;
import com.racingteam.dto.SessionManualRequest;
import com.racingteam.dto.SessionRequest;
import com.racingteam.model.User;
import com.racingteam.service.SessionAnalyticsService;
import com.racingteam.service.SessionService;
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
    private final ObjectMapper objectMapper;
    private final Validator validator;

    public SessionController(SessionService sessionService,
                             SessionAnalyticsService analyticsService,
                             ObjectMapper objectMapper,
                             Validator validator) {
        this.sessionService = sessionService;
        this.analyticsService = analyticsService;
        this.objectMapper = objectMapper;
        this.validator = validator;
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
                # Plantilla de tiempos por vuelta para Racing Team Management
                # Edita este archivo con tus datos y súbelo en la pestaña "Subir CSV".
                # Columnas reconocidas (en cualquier orden):
                #   lap        Número de vuelta (1, 2, 3...)
                #   time       Tiempo de vuelta. Formatos: 1:23.456 / 83.456 / 83456 (ms)
                #   s1, s2, s3 Tiempos de sector (opcionales, mismo formato)
                #   valid      true/false (opcional, por defecto true)
                #   compound   SOFT / MEDIUM / HARD / INTERMEDIATE / WET (opcional)
                #   fuel       Combustible en kg (opcional)
                #   notes      Notas libres (opcional)
                #
                # Separadores admitidos: coma o punto y coma.
                # Las líneas que empiezan por # se ignoran.
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
