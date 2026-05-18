package com.racingteam.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.racingteam.dto.SessionDto;
import com.racingteam.dto.SessionRequest;
import com.racingteam.model.User;
import com.racingteam.service.SessionService;
import jakarta.validation.Valid;
import jakarta.validation.Validator;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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
    private final ObjectMapper objectMapper;
    private final Validator validator;

    public SessionController(SessionService sessionService,
                             ObjectMapper objectMapper,
                             Validator validator) {
        this.sessionService = sessionService;
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

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ENGINEER')")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal User current) {
        sessionService.delete(id, current.getTeam().getId());
        return ResponseEntity.noContent().build();
    }
}
