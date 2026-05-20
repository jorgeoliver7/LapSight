package com.lapsight.service;

import com.lapsight.dto.LapInputDto;
import com.lapsight.dto.SessionDto;
import com.lapsight.dto.SessionManualRequest;
import com.lapsight.dto.SessionRequest;
import com.lapsight.model.LapTime;
import com.lapsight.model.Session;
import com.lapsight.model.Team;
import com.lapsight.model.User;
import com.lapsight.model.Vehicle;
import com.lapsight.repository.SessionRepository;
import com.lapsight.repository.TeamRepository;
import com.lapsight.repository.UserRepository;
import com.lapsight.repository.VehicleRepository;
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
    public SessionDto createManual(Long teamId, SessionManualRequest request) {
        List<LapTime> laps = new java.util.ArrayList<>(request.getLaps().size());
        for (LapInputDto input : request.getLaps()) {
            Long timeMs = LapTimeFormatter.parseToMs(input.getLapTime());
            if (timeMs == null) {
                throw new IllegalArgumentException(
                        "Vuelta " + input.getLapNumber() + ": tiempo inválido '" + input.getLapTime() + "'");
            }
            LapTime lap = new LapTime(input.getLapNumber(), timeMs);
            lap.setSector1Ms(LapTimeFormatter.parseToMs(input.getSector1()));
            lap.setSector2Ms(LapTimeFormatter.parseToMs(input.getSector2()));
            lap.setSector3Ms(LapTimeFormatter.parseToMs(input.getSector3()));
            lap.setValid(input.getValid() == null ? Boolean.TRUE : input.getValid());
            lap.setCompound(input.getCompound());
            lap.setFuelKg(input.getFuelKg());
            lap.setNotes(input.getNotes());
            laps.add(lap);
        }

        Session session = buildSession(teamId,
                request.getName(), request.getCircuit(), request.getSessionDate(),
                request.getSessionType(), request.getTrackCondition(), request.getDurationMinutes(),
                request.getNotes(), request.getVehicleId(), request.getDriverId());
        session.setTrackTempC(request.getTrackTempC());
        session.setAmbientTempC(request.getAmbientTempC());
        session.setHumidityPct(request.getHumidityPct());
        session.setWindKph(request.getWindKph());
        session.setSetupNotes(request.getSetupNotes());
        laps.forEach(session::addLap);
        return SessionDto.detail(sessionRepository.save(session));
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

        Session session = buildSession(teamId,
                request.getName(), request.getCircuit(), request.getSessionDate(),
                request.getSessionType(), request.getTrackCondition(), request.getDurationMinutes(),
                request.getNotes(), request.getVehicleId(), request.getDriverId());
        session.setTrackTempC(request.getTrackTempC());
        session.setAmbientTempC(request.getAmbientTempC());
        session.setHumidityPct(request.getHumidityPct());
        session.setWindKph(request.getWindKph());
        session.setSetupNotes(request.getSetupNotes());
        laps.forEach(session::addLap);
        Session saved = sessionRepository.save(session);
        return SessionDto.detail(saved);
    }

    private Session buildSession(Long teamId,
                                 String name, String circuit, java.time.LocalDateTime date,
                                 com.lapsight.model.SessionType type,
                                 com.lapsight.model.TrackCondition cond,
                                 Integer durationMinutes, String notes,
                                 Long vehicleId, Long driverId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new EntityNotFoundException("Equipo no encontrado: " + teamId));

        Session session = new Session();
        session.setName(name);
        session.setCircuit(circuit);
        session.setSessionDate(date);
        session.setSessionType(type);
        session.setTrackCondition(cond);
        session.setDurationMinutes(durationMinutes);
        session.setNotes(notes);
        session.setTeam(team);

        if (vehicleId != null) {
            Vehicle vehicle = vehicleRepository.findByIdAndTeamId(vehicleId, teamId)
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Vehículo " + vehicleId + " no pertenece al equipo"));
            session.setVehicle(vehicle);
        }
        if (driverId != null) {
            User driver = userRepository.findByIdAndTeamId(driverId, teamId)
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Piloto " + driverId + " no pertenece al equipo"));
            session.setDriver(driver);
        }
        return session;
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
