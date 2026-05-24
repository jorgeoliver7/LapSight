package com.lapsight.config;

import com.lapsight.model.Team;
import com.lapsight.model.User;
import com.lapsight.model.UserRole;
import com.lapsight.model.VehicleCategory;
import com.lapsight.repository.TeamRepository;
import com.lapsight.repository.UserRepository;
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
    private final DemoSeedService demoSeed;
    private final boolean demoEnabled;
    private final String adminEmail;
    private final String adminPassword;
    private final String demoTeamName;

    public DataInitializer(TeamRepository teamRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           DemoSeedService demoSeed,
                           @Value("${app.seed.demo-data:false}") boolean demoEnabled,
                           @Value("${app.seed.admin-email:}") String adminEmail,
                           @Value("${app.seed.admin-password:}") String adminPassword,
                           @Value("${app.seed.team-name:Demo Racing Team}") String demoTeamName) {
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.demoSeed = demoSeed;
        this.demoEnabled = demoEnabled;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.demoTeamName = demoTeamName;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!demoEnabled) {
            log.info("Demo seed disabled (APP_SEED_DEMO_DATA=false). Skipping demo data init.");
            return;
        }
        if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
            log.warn("Demo seed is enabled but APP_SEED_ADMIN_EMAIL or APP_SEED_ADMIN_PASSWORD is empty. Skipping.");
            return;
        }

        Team team = teamRepository.findAll().stream()
                .filter(t -> demoTeamName.equals(t.getName()))
                .findFirst()
                .orElseGet(this::createDemoTeam);

        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User();
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setFirstName("Admin");
            admin.setLastName("Racing");
            admin.setRole(UserRole.MANAGER);
            admin.setActive(true);
            admin.setTeam(team);

            userRepository.save(admin);
            log.info("Seed admin '{}' created for team '{}'", adminEmail, team.getName());
        } else {
            log.info("Seed admin '{}' already exists — skipping", adminEmail);
        }

        demoSeed.seedIfEmpty(team);
    }

    private Team createDemoTeam() {
        Team team = new Team(demoTeamName, VehicleCategory.CAR);
        team.setDescription("Demo team created at first startup");
        team.setContactEmail("contacto@" + demoTeamName.toLowerCase().replace(" ", "") + ".com");
        team.setActive(true);
        Team saved = teamRepository.save(team);
        log.info("Equipo demo '{}' creado", saved.getName());
        return saved;
    }
}
