package com.lapsight.service;

import com.lapsight.dto.VehicleDto;
import com.lapsight.dto.VehicleRequest;
import com.lapsight.model.Team;
import com.lapsight.model.Vehicle;
import com.lapsight.model.VehicleStatus;
import com.lapsight.repository.TeamRepository;
import com.lapsight.repository.VehicleRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final TeamRepository teamRepository;

    public VehicleService(VehicleRepository vehicleRepository, TeamRepository teamRepository) {
        this.vehicleRepository = vehicleRepository;
        this.teamRepository = teamRepository;
    }

    @Transactional(readOnly = true)
    public List<VehicleDto> findAllByTeam(Long teamId) {
        return vehicleRepository.findAllByTeamId(teamId).stream()
                .map(VehicleDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public VehicleDto findByIdInTeam(Long id, Long teamId) {
        return VehicleDto.fromEntity(getVehicleOrThrow(id, teamId));
    }

    @Transactional
    public VehicleDto create(Long teamId, VehicleRequest request) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new EntityNotFoundException("Team not found: " + teamId));

        Vehicle vehicle = new Vehicle();
        vehicle.setTeam(team);
        vehicle.setActive(true);
        applyRequest(vehicle, request);
        return VehicleDto.fromEntity(vehicleRepository.save(vehicle));
    }

    @Transactional
    public VehicleDto update(Long id, Long teamId, VehicleRequest request) {
        Vehicle vehicle = getVehicleOrThrow(id, teamId);
        applyRequest(vehicle, request);
        return VehicleDto.fromEntity(vehicleRepository.save(vehicle));
    }

    @Transactional
    public void deactivate(Long id, Long teamId) {
        Vehicle vehicle = getVehicleOrThrow(id, teamId);
        vehicle.setActive(false);
        vehicle.setStatus(VehicleStatus.OUT_OF_SERVICE);
        vehicleRepository.save(vehicle);
    }

    private Vehicle getVehicleOrThrow(Long id, Long teamId) {
        return vehicleRepository.findByIdAndTeamId(id, teamId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Vehicle " + id + " not found in team " + teamId));
    }

    private void applyRequest(Vehicle vehicle, VehicleRequest request) {
        vehicle.setName(request.getName());
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setChassisNumber(request.getChassisNumber());
        vehicle.setEngineNumber(request.getEngineNumber());
        vehicle.setRegistrationNumber(request.getRegistrationNumber());
        vehicle.setManufacturer(request.getManufacturer());
        vehicle.setModel(request.getModel());
        vehicle.setYearManufactured(request.getYearManufactured());
        if (request.getTotalHours() != null) vehicle.setTotalHours(request.getTotalHours());
        if (request.getTotalKilometers() != null) vehicle.setTotalKilometers(request.getTotalKilometers());
        vehicle.setNextMaintenanceHours(request.getNextMaintenanceHours());
        vehicle.setNextMaintenanceKm(request.getNextMaintenanceKm());
        if (request.getStatus() != null) vehicle.setStatus(request.getStatus());
        vehicle.setNotes(request.getNotes());

        if (vehicle.getTotalHours() == null) vehicle.setTotalHours(BigDecimal.ZERO);
        if (vehicle.getTotalKilometers() == null) vehicle.setTotalKilometers(BigDecimal.ZERO);
    }
}
