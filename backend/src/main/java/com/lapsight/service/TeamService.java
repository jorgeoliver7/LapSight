package com.lapsight.service;

import com.lapsight.dto.TeamDto;
import com.lapsight.dto.TeamRequest;
import com.lapsight.model.Team;
import com.lapsight.repository.TeamRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TeamService {

    private final TeamRepository teamRepository;

    public TeamService(TeamRepository teamRepository) {
        this.teamRepository = teamRepository;
    }

    @Transactional(readOnly = true)
    public List<TeamDto> findAll() {
        return teamRepository.findAll().stream()
                .map(TeamDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public TeamDto findById(Long id) {
        return TeamDto.fromEntity(getTeamOrThrow(id));
    }

    @Transactional
    public TeamDto create(TeamRequest request) {
        Team team = new Team();
        applyRequest(team, request);
        team.setActive(true);
        return TeamDto.fromEntity(teamRepository.save(team));
    }

    @Transactional
    public TeamDto update(Long id, TeamRequest request) {
        Team team = getTeamOrThrow(id);
        applyRequest(team, request);
        return TeamDto.fromEntity(teamRepository.save(team));
    }

    @Transactional
    public void deactivate(Long id) {
        Team team = getTeamOrThrow(id);
        team.setActive(false);
        teamRepository.save(team);
    }

    private Team getTeamOrThrow(Long id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Team not found: " + id));
    }

    private void applyRequest(Team team, TeamRequest request) {
        team.setName(request.getName());
        team.setDescription(request.getDescription());
        team.setLogoUrl(request.getLogoUrl());
        team.setPrimaryCategory(request.getPrimaryCategory());
        team.setContactEmail(request.getContactEmail());
        team.setContactPhone(request.getContactPhone());
        team.setHeadquartersLocation(request.getHeadquartersLocation());
    }
}
