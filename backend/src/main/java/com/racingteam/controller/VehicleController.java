package com.racingteam.controller;

import com.racingteam.dto.VehicleDto;
import com.racingteam.dto.VehicleRequest;
import com.racingteam.model.User;
import com.racingteam.service.VehicleService;
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
@RequestMapping("/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public ResponseEntity<List<VehicleDto>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(vehicleService.findAllByTeam(user.getTeam().getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleDto> get(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(vehicleService.findByIdInTeam(id, user.getTeam().getId()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ENGINEER', 'MECHANIC')")
    public ResponseEntity<VehicleDto> create(@Valid @RequestBody VehicleRequest request,
                                             @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(vehicleService.create(user.getTeam().getId(), request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ENGINEER', 'MECHANIC')")
    public ResponseEntity<VehicleDto> update(@PathVariable Long id,
                                             @Valid @RequestBody VehicleRequest request,
                                             @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(vehicleService.update(id, user.getTeam().getId(), request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal User user) {
        vehicleService.deactivate(id, user.getTeam().getId());
        return ResponseEntity.noContent().build();
    }
}
