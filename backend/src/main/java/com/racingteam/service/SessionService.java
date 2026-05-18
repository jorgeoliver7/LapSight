package com.racingteam.service;

import com.racingteam.dto.SessionDto;
import com.racingteam.dto.SessionRequest;
import com.racingteam.model.LapTime;
import com.racingteam.model.Session;
import com.racingteam.model.Team;
import com.racingteam.model.User;
import com.racingteam.model.Vehicle;
import com.racingteam.repository.SessionRepository;
import com.racingteam.repository.TeamRepository;
import com.racingteam.repository.UserRepository;
import com.racingteam.repository.VehicleRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class SessionService {

    private final SessionRepository sessionRepository;
    private final TeamRepository teamRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final LapCsvParser csvParser;

    public SessionService(SessionRepository sessionRepository,
                          TeamRepository teamRepository,
                          VehicleRepository vehicleRepository,
                          UserRepository userRepository,
                          LapCsvParser csvParser) {
        this.sessionRepository = sessionRepository;
        this.teamRepository = teamRepository;
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.csvParser = csvParser;
    }

    @Transactional(readOnly = true)
    public List<SessionDto> findAllByTeam(Long teamId) {
        return sessionRepository.findAllByTeamIdOrderBySessionDateDesc(teamId).stream()
                .map(SessionDto::summary)
                .toList();
    }

    @Transactional(readOnly = true)
    public SessionDto findByIdInTeam(Long id, Long teamId) {
        return SessionDto.detail(getSessionOrThrow(id, teamId));
    }

    @Transactional
    public SessionDto create(Long teamId, SessionRequest request, MultipartFile csv) {
        if (csv == null || csv.isEmpty()) {
            throw new IllegalArgumentException("El CSV de vueltas es obligatorio");
        }

        List<LapTime> laps;
        try {
            laps = csvParser.parse(csv.getInputStream());
        } catch (IOException e) {
            throw new IllegalArgumentException("No se pudo leer el CSV: " + e.getMessage());
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new EntityNotFoundException("Equipo no encontrado: " + teamId));

        Session session = new Session();
        session.setName(request.getName());
        session.setCircuit(request.getCircuit());
        session.setSessionDate(request.getSessionDate());
        session.setSessionType(request.getSessionType());
        session.setTrackCondition(request.getTrackCondition());
        session.setDurationMinutes(request.getDurationMinutes());
        session.setNotes(request.getNotes());
        session.setTeam(team);

        if (request.getVehicleId() != null) {
            Vehicle vehicle = vehicleRepository.findByIdAndTeamId(request.getVehicleId(), teamId)
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Vehículo " + request.getVehicleId() + " no pertenece al equipo"));
            session.setVehicle(vehicle);
        }

        if (request.getDriverId() != null) {
            User driver = userRepository.findByIdAndTeamId(request.getDriverId(), teamId)
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Piloto " + request.getDriverId() + " no pertenece al equipo"));
            session.setDriver(driver);
        }

        laps.forEach(session::addLap);
        Session saved = sessionRepository.save(session);
        return SessionDto.detail(saved);
    }

    @Transactional
    public void delete(Long id, Long teamId) {
        Session session = getSessionOrThrow(id, teamId);
        sessionRepository.delete(session);
    }

    private Session getSessionOrThrow(Long id, Long teamId) {
        return sessionRepository.findByIdAndTeamId(id, teamId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Sesión " + id + " no encontrada en el equipo " + teamId));
    }
}
