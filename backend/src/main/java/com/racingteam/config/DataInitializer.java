package com.racingteam.config;

import com.racingteam.model.Team;
import com.racingteam.model.User;
import com.racingteam.model.UserRole;
import com.racingteam.model.VehicleCategory;
import com.racingteam.repository.TeamRepository;
import com.racingteam.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("!test")
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;
    private final String demoTeamName;

    public DataInitializer(TeamRepository teamRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           @Value("${app.seed.admin-email:admin@racing.com}") String adminEmail,
                           @Value("${app.seed.admin-password:admin123}") String adminPassword,
                           @Value("${app.seed.team-name:Demo Racing Team}") String demoTeamName) {
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.demoTeamName = demoTeamName;
    }

    @Override
    @Transactional
    public void run(String... args) {
        Team team = teamRepository.findAll().stream()
                .filter(t -> demoTeamName.equals(t.getName()))
                .findFirst()
                .orElseGet(this::createDemoTeam);

        if (userRepository.existsByEmail(adminEmail)) {
            log.info("Usuario admin '{}' ya existe — no se vuelve a crear", adminEmail);
            return;
        }

        User admin = new User();
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setFirstName("Admin");
        admin.setLastName("Racing");
        admin.setRole(UserRole.MANAGER);
        admin.setActive(true);
        admin.setTeam(team);

        userRepository.save(admin);
        log.info("Usuario admin '{}' creado para el equipo '{}'", adminEmail, team.getName());
    }

    private Team createDemoTeam() {
        Team team = new Team(demoTeamName, VehicleCategory.CAR);
        team.setDescription("Equipo demo creado en el primer arranque");
        team.setContactEmail("contacto@" + demoTeamName.toLowerCase().replace(" ", "") + ".com");
        team.setActive(true);
        Team saved = teamRepository.save(team);
        log.info("Equipo demo '{}' creado", saved.getName());
        return saved;
    }
}
