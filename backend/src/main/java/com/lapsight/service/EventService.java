package com.lapsight.service;

import com.lapsight.dto.EventDto;
import com.lapsight.dto.EventRequest;
import com.lapsight.model.Event;
import com.lapsight.model.EventStatus;
import com.lapsight.model.Team;
import com.lapsight.model.User;
import com.lapsight.model.Vehicle;
import com.lapsight.repository.EventRepository;
import com.lapsight.repository.TeamRepository;
import com.lapsight.repository.UserRepository;
import com.lapsight.repository.VehicleRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;

    public EventService(EventRepository eventRepository,
                        TeamRepository teamRepository,
                        UserRepository userRepository,
                        VehicleRepository vehicleRepository) {
        this.eventRepository = eventRepository;
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @Transactional(readOnly = true)
    public List<EventDto> findAllByTeam(Long teamId) {
        return eventRepository.findAllByTeamIdOrderByStartDateDesc(teamId).stream()
                .map(EventDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public EventDto findByIdInTeam(Long id, Long teamId) {
        return EventDto.fromEntity(getEventOrThrow(id, teamId));
    }

    @Transactional
    public EventDto create(Long teamId, EventRequest request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date must be after the start date");
        }
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new EntityNotFoundException("Team not found: " + teamId));

        Event event = new Event();
        applyRequest(event, request, teamId);
        event.setTeam(team);
        if (event.getStatus() == null) event.setStatus(EventStatus.PLANNED);

        return EventDto.fromEntity(eventRepository.save(event));
    }

    @Transactional
    public EventDto update(Long id, Long teamId, EventRequest request) {
        Event event = getEventOrThrow(id, teamId);
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date must be after the start date");
        }
        applyRequest(event, request, teamId);
        return EventDto.fromEntity(eventRepository.save(event));
    }

    @Transactional
    public void delete(Long id, Long teamId) {
        Event event = getEventOrThrow(id, teamId);
        eventRepository.delete(event);
    }

    private Event getEventOrThrow(Long id, Long teamId) {
        return eventRepository.findByIdAndTeamId(id, teamId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Event " + id + " not found in team " + teamId));
    }

    private void applyRequest(Event event, EventRequest request, Long teamId) {
        event.setName(request.getName());
        event.setDescription(request.getDescription());
        event.setEventType(request.getEventType());
        event.setStartDate(request.getStartDate());
        event.setEndDate(request.getEndDate());
        event.setLocation(request.getLocation());
        event.setCircuitName(request.getCircuitName());
        if (request.getStatus() != null) event.setStatus(request.getStatus());
        event.setNotes(request.getNotes());
        event.setBudgetAllocated(request.getBudgetAllocated());
        event.setActualCost(request.getActualCost());

        if (request.getParticipantIds() != null) {
            List<User> participants = request.getParticipantIds().stream()
                    .map(uid -> userRepository.findByIdAndTeamId(uid, teamId)
                            .orElseThrow(() -> new EntityNotFoundException(
                                    "Participant " + uid + " does not belong to the team")))
                    .toList();
            event.getParticipants().clear();
            event.getParticipants().addAll(participants);
        }

        if (request.getVehicleIds() != null) {
            List<Vehicle> vehicles = request.getVehicleIds().stream()
                    .map(vid -> vehicleRepository.findByIdAndTeamId(vid, teamId)
                            .orElseThrow(() -> new EntityNotFoundException(
                                    "Vehicle " + vid + " does not belong to the team")))
                    .toList();
            event.getVehicles().clear();
            event.getVehicles().addAll(vehicles);
        }
    }
}
