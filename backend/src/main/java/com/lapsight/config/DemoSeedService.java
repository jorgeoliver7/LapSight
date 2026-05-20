package com.lapsight.config;

import com.lapsight.config.LapTimeGenerator.StintSpec;
import com.lapsight.model.LapTime;
import com.lapsight.model.Session;
import com.lapsight.model.SessionType;
import com.lapsight.model.Team;
import com.lapsight.model.TireCompound;
import com.lapsight.model.TrackCondition;
import com.lapsight.model.User;
import com.lapsight.model.UserRole;
import com.lapsight.model.Vehicle;
import com.lapsight.model.VehicleStatus;
import com.lapsight.model.VehicleType;
import com.lapsight.repository.SessionRepository;
import com.lapsight.repository.TeamRepository;
import com.lapsight.repository.UserRepository;
import com.lapsight.repository.VehicleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Crea datos demo realistas en el primer arranque: pilotos, vehículos y sesiones
 * con tiempos generados que reflejan circuitos reales españoles.
 *
 * Idempotente: si una sesión con ese nombre ya existe, no se recrea.
 * Sólo añade datos si el equipo demo está prácticamente vacío.
 */
@Service
public class DemoSeedService {

    private static final Logger log = LoggerFactory.getLogger(DemoSeedService.class);

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final SessionRepository sessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean enabled;

    public DemoSeedService(TeamRepository teamRepository,
                           UserRepository userRepository,
                           VehicleRepository vehicleRepository,
                           SessionRepository sessionRepository,
                           PasswordEncoder passwordEncoder,
                           @Value("${app.seed.demo-data:true}") boolean enabled) {
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.sessionRepository = sessionRepository;
        this.passwordEncoder = passwordEncoder;
        this.enabled = enabled;
    }

    @Transactional
    public void seedIfEmpty(Team team) {
        if (!enabled) {
            log.info("Demo seed deshabilitado (app.seed.demo-data=false)");
            return;
        }

        List<User> pilots = seedPilots(team);
        List<Vehicle> vehicles = seedVehicles(team);
        seedSessions(team, pilots, vehicles);
        log.info("Demo seed: completado para equipo '{}'", team.getName());
    }

    private List<User> seedPilots(Team team) {
        List<UserSeed> seeds = List.of(
                new UserSeed("alonso@demo.racing", "Fernando", "Alonso", UserRole.PILOT, "FIA-14"),
                new UserSeed("sainz@demo.racing", "Carlos", "Sainz", UserRole.PILOT, "FIA-55"),
                new UserSeed("delarosa@demo.racing", "Pedro", "de la Rosa", UserRole.PILOT, "FIA-PdR"),
                new UserSeed("garcia@demo.racing", "María", "García", UserRole.ENGINEER, null),
                new UserSeed("rivera@demo.racing", "Javier", "Rivera", UserRole.MECHANIC, null)
        );

        return seeds.stream().map(seed -> {
            Optional<User> existing = userRepository.findByEmail(seed.email);
            if (existing.isPresent()) return existing.get();
            User u = new User();
            u.setEmail(seed.email);
            u.setPassword(passwordEncoder.encode("demo1234"));
            u.setFirstName(seed.firstName);
            u.setLastName(seed.lastName);
            u.setRole(seed.role);
            u.setLicenseNumber(seed.licenseNumber);
            u.setActive(true);
            u.setTeam(team);
            User saved = userRepository.save(u);
            log.info("Demo seed: usuario '{}' creado", saved.getEmail());
            return saved;
        }).toList();
    }

    private List<Vehicle> seedVehicles(Team team) {
        List<VehicleSeed> seeds = List.of(
                new VehicleSeed("Dallara F4 #23", VehicleType.FORMULA_4, "Dallara", "F4-T421", 2024,
                        BigDecimal.valueOf(245.5), BigDecimal.valueOf(4820)),
                new VehicleSeed("Porsche GT3 #88", VehicleType.GT3, "Porsche", "911 GT3 R", 2024,
                        BigDecimal.valueOf(180.0), BigDecimal.valueOf(3200)),
                new VehicleSeed("Aprilia MotoGP #41", VehicleType.MOTOGP, "Aprilia", "RS-GP", 2025,
                        BigDecimal.valueOf(95.0), BigDecimal.valueOf(1850)),
                new VehicleSeed("Cupra León TCR #5", VehicleType.TCR, "Cupra", "León VZ TCR", 2024,
                        BigDecimal.valueOf(310.0), BigDecimal.valueOf(5400))
        );

        return seeds.stream().map(seed -> {
            Optional<Vehicle> existing = vehicleRepository.findAllByTeamId(team.getId()).stream()
                    .filter(v -> v.getName().equals(seed.name)).findFirst();
            if (existing.isPresent()) return existing.get();
            Vehicle v = new Vehicle();
            v.setName(seed.name);
            v.setVehicleType(seed.type);
            v.setManufacturer(seed.manufacturer);
            v.setModel(seed.model);
            v.setYearManufactured(seed.year);
            v.setTotalHours(seed.hours);
            v.setTotalKilometers(seed.km);
            v.setStatus(VehicleStatus.AVAILABLE);
            v.setActive(true);
            v.setTeam(team);
            Vehicle saved = vehicleRepository.save(v);
            log.info("Demo seed: vehículo '{}' creado", saved.getName());
            return saved;
        }).toList();
    }

    private void seedSessions(Team team, List<User> pilots, List<Vehicle> vehicles) {
        User alonso = findByEmail(pilots, "alonso@demo.racing");
        User sainz = findByEmail(pilots, "sainz@demo.racing");
        User delaRosa = findByEmail(pilots, "delarosa@demo.racing");

        Vehicle f4 = findByName(vehicles, "Dallara F4 #23");
        Vehicle gt3 = findByName(vehicles, "Porsche GT3 #88");
        Vehicle motogp = findByName(vehicles, "Aprilia MotoGP #41");
        Vehicle tcr = findByName(vehicles, "Cupra León TCR #5");

        LocalDateTime now = LocalDateTime.now();

        // 1. F4 quali en Jarama — un stint corto, neumáticos blandos, pace fresco
        createSession(team, "Quali F4 - Jarama", "Circuito del Jarama", now.minusDays(14),
                SessionType.QUALIFYING, TrackCondition.DRY, 15, f4, alonso,
                List.of(new StintSpec(8, 95400, 30, TireCompound.SOFT)),
                "Vuelta de pole 1:35.4. Sesión limpia, pista en condiciones óptimas.",
                1001L);

        // 2. F4 race Jarama — 2 stints (soft + medium), 18 vueltas, degradación visible
        createSession(team, "Race F4 - Jarama", "Circuito del Jarama", now.minusDays(13),
                SessionType.RACE, TrackCondition.DRY, 30, f4, alonso,
                List.of(
                        new StintSpec(10, 95800, 80, TireCompound.SOFT),
                        new StintSpec(8, 96400, 60, TireCompound.MEDIUM)
                ),
                "Cambio de compuesto en vuelta 11. Buena gestión de degradación.",
                1002L);

        // 3. GT3 enduro Cheste — stint largo con degradación clara
        createSession(team, "Endurance GT3 - Cheste", "Circuit Ricardo Tormo", now.minusDays(10),
                SessionType.RACE, TrackCondition.DRY, 60, gt3, sainz,
                List.of(
                        new StintSpec(15, 89200, 110, TireCompound.MEDIUM),
                        new StintSpec(15, 90500, 130, TireCompound.HARD)
                ),
                "Strint de medium + hard. Degradación notable hacia el final, plan de boxes correcto.",
                1003L);

        // 4. MotoGP test Aragón — varias series corras
        createSession(team, "Test MotoGP - MotorLand", "MotorLand Aragón", now.minusDays(7),
                SessionType.TEST, TrackCondition.DRY, 45, motogp, sainz,
                List.of(
                        new StintSpec(6, 91500, 50, TireCompound.MEDIUM),
                        new StintSpec(7, 91100, 70, TireCompound.SOFT)
                ),
                "Comparativa medium vs soft. Soft +0.4s mejor en vuelta limpia.",
                1004L);

        // 5. TCR practice Navarra — sesión con out lap + 1 vuelta inválida (track limits)
        createSession(team, "Libres TCR - Navarra", "Circuito de Navarra", now.minusDays(5),
                SessionType.PRACTICE, TrackCondition.DRY, 25, tcr, delaRosa,
                List.of(new StintSpec(12, 100100, 70, TireCompound.MEDIUM)),
                "1ª sesión de la jornada. Track limits en vuelta 6 anulada.",
                1005L);

        // 6. F4 race con lluvia: tiempos +6s, condición WET
        createSession(team, "Race F4 - Cheste (lluvia)", "Circuit Ricardo Tormo", now.minusDays(3),
                SessionType.RACE, TrackCondition.WET, 25, f4, alonso,
                List.of(new StintSpec(12, 102500, 90, TireCompound.WET)),
                "Lluvia constante. Lap times ~6s por encima de seco. Pista exigente.",
                1006L);

        // 7. Shakedown reciente
        createSession(team, "Shakedown GT3 - Castellolí", "Parcmotor Castellolí", now.minusDays(1),
                SessionType.SHAKEDOWN, TrackCondition.DRY, 20, gt3, sainz,
                List.of(new StintSpec(6, 87800, 40, TireCompound.SOFT)),
                "Verificación post-mantenimiento. Todo OK.",
                1007L);
    }

    private void createSession(Team team, String name, String circuit, LocalDateTime date,
                               SessionType type, TrackCondition cond, Integer duration,
                               Vehicle vehicle, User driver,
                               List<StintSpec> stints, String notes, long seed) {
        boolean exists = sessionRepository.findAllByTeamIdOrderBySessionDateDesc(team.getId()).stream()
                .anyMatch(s -> s.getName().equals(name));
        if (exists) return;

        Session session = new Session();
        session.setName(name);
        session.setCircuit(circuit);
        session.setSessionDate(date);
        session.setSessionType(type);
        session.setTrackCondition(cond);
        session.setDurationMinutes(duration);
        session.setNotes(notes);
        session.setTeam(team);
        session.setVehicle(vehicle);
        session.setDriver(driver);

        List<LapTime> laps = LapTimeGenerator.generate(stints, seed);
        // Marca una vuelta como inválida en Navarra (track limits)
        if (name.contains("Navarra") && laps.size() >= 6) {
            laps.get(5).setValid(false);
            laps.get(5).setNotes("Track limits");
        }
        laps.forEach(session::addLap);
        sessionRepository.save(session);
        log.info("Demo seed: sesión '{}' creada ({} vueltas, {} stint(s))",
                name, laps.size(), stints.size());
    }

    private User findByEmail(List<User> users, String email) {
        return users.stream().filter(u -> u.getEmail().equals(email)).findFirst()
                .orElseThrow(() -> new IllegalStateException("Pilot not found: " + email));
    }

    private Vehicle findByName(List<Vehicle> vehicles, String name) {
        return vehicles.stream().filter(v -> v.getName().equals(name)).findFirst()
                .orElseThrow(() -> new IllegalStateException("Vehicle not found: " + name));
    }

    private record UserSeed(String email, String firstName, String lastName,
                            UserRole role, String licenseNumber) {}
    private record VehicleSeed(String name, VehicleType type, String manufacturer,
                               String model, Integer year, BigDecimal hours, BigDecimal km) {}
}
