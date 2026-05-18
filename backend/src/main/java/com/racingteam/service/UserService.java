package com.racingteam.service;

import com.racingteam.dto.UserCreateRequest;
import com.racingteam.dto.UserDto;
import com.racingteam.dto.UserUpdateRequest;
import com.racingteam.model.Team;
import com.racingteam.model.User;
import com.racingteam.repository.TeamRepository;
import com.racingteam.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       TeamRepository teamRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.teamRepository = teamRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserDto> findAllByTeam(Long teamId) {
        return userRepository.findAllByTeamId(teamId).stream()
                .map(UserDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserDto findByIdInTeam(Long id, Long teamId) {
        return UserDto.fromEntity(getUserOrThrow(id, teamId));
    }

    @Transactional
    public UserDto create(Long teamId, UserCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Ya existe un usuario con ese email");
        }
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new EntityNotFoundException("Equipo no encontrado: " + teamId));

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setLicenseNumber(request.getLicenseNumber());
        user.setRole(request.getRole());
        user.setActive(true);
        user.setTeam(team);

        return UserDto.fromEntity(userRepository.save(user));
    }

    @Transactional
    public UserDto update(Long id, Long teamId, UserUpdateRequest request) {
        User user = getUserOrThrow(id, teamId);
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(request.getRole());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setLicenseNumber(request.getLicenseNumber());
        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }
        return UserDto.fromEntity(userRepository.save(user));
    }

    @Transactional
    public void deactivate(Long id, Long teamId) {
        User user = getUserOrThrow(id, teamId);
        user.setActive(false);
        userRepository.save(user);
    }

    private User getUserOrThrow(Long id, Long teamId) {
        return userRepository.findByIdAndTeamId(id, teamId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Usuario " + id + " no encontrado en el equipo " + teamId));
    }
}
