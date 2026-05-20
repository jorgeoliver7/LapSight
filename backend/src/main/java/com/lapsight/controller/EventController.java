package com.lapsight.controller;

import com.lapsight.dto.EventDto;
import com.lapsight.dto.EventRequest;
import com.lapsight.model.User;
import com.lapsight.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public ResponseEntity<List<EventDto>> list(@AuthenticationPrincipal User current) {
        return ResponseEntity.ok(eventService.findAllByTeam(current.getTeam().getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDto> get(@PathVariable Long id, @AuthenticationPrincipal User current) {
        return ResponseEntity.ok(eventService.findByIdInTeam(id, current.getTeam().getId()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'LOGISTICS')")
    public ResponseEntity<EventDto> create(@Valid @RequestBody EventRequest request,
                                           @AuthenticationPrincipal User current) {
        return ResponseEntity.ok(eventService.create(current.getTeam().getId(), request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOGISTICS')")
    public ResponseEntity<EventDto> update(@PathVariable Long id,
                                           @Valid @RequestBody EventRequest request,
                                           @AuthenticationPrincipal User current) {
        return ResponseEntity.ok(eventService.update(id, current.getTeam().getId(), request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal User current) {
        eventService.delete(id, current.getTeam().getId());
        return ResponseEntity.noContent().build();
    }
}
