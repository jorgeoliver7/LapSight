package com.lapsight.service;

import com.lapsight.dto.UserDto;
import com.lapsight.dto.auth.AuthResponse;
import com.lapsight.dto.auth.LoginRequest;
import com.lapsight.dto.auth.RegisterRequest;
import com.lapsight.model.Team;
import com.lapsight.model.User;
import com.lapsight.model.UserRole;
import com.lapsight.model.VehicleCategory;
import com.lapsight.repository.TeamRepository;
import com.lapsight.repository.UserRepository;
import com.lapsight.security.JwtService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final boolean demoEnabled;
    private final String demoEmail;

    public AuthService(UserRepository userRepository,
                       TeamRepository teamRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager,
                       @Value("${app.seed.demo-data:false}") boolean demoEnabled,
                       @Value("${app.seed.admin-email:}") String demoEmail) {
        this.userRepository = userRepository;
        this.teamRepository = teamRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.demoEnabled = demoEnabled;
        this.demoEmail = demoEmail;
    }

    /**
     * Public demo login. Returns a JWT for the seeded demo admin without
     * exposing its password anywhere outside the backend.
     * Only works when APP_SEED_DEMO_DATA=true (i.e. demo mode is intentional).
     */
    public AuthResponse demoLogin() {
        if (!demoEnabled || demoEmail == null || demoEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Demo mode is disabled");
        }
        User user = userRepository.findByEmail(demoEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Demo account not provisioned"));
        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Demo account disabled");
        }
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, jwtService.getExpirationMillis(), UserDto.fromEntity(user));
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, jwtService.getExpirationMillis(), UserDto.fromEntity(user));
    }

    /**
     * Self-register: crea un nuevo team propio para el usuario y le asigna rol MANAGER.
     * El team es 100% del nuevo usuario — no se reutiliza ningún team existente.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Ya existe un usuario con ese email");
        }

        VehicleCategory category = request.getTeamCategory() != null
                ? request.getTeamCategory()
                : VehicleCategory.CAR;

        Team team = new Team(request.getTeamName(), category);
        team.setDescription("Creado al registrar " + request.getEmail());
        team.setContactEmail(request.getEmail());
        team.setActive(true);
        Team savedTeam = teamRepository.save(team);

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(UserRole.MANAGER);
        user.setTeam(savedTeam);
        user.setActive(true);

        User saved = userRepository.save(user);

        String token = jwtService.generateToken(saved);
        return new AuthResponse(token, jwtService.getExpirationMillis(), UserDto.fromEntity(saved));
    }

    public UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));
        return UserDto.fromEntity(user);
    }
}
