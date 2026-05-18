-- Migración V2: tablas para Race Analytics
-- Sesiones de pista y vueltas asociadas

CREATE TABLE sessions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    circuit VARCHAR(150),
    session_date TIMESTAMP NOT NULL,
    session_type VARCHAR(30) NOT NULL CHECK (session_type IN (
        'PRACTICE', 'QUALIFYING', 'RACE', 'TEST', 'SHAKEDOWN', 'TIME_ATTACK'
    )),
    track_condition VARCHAR(20) CHECK (track_condition IN ('DRY', 'WET', 'MIXED', 'DAMP')),
    duration_minutes INTEGER,
    notes VARCHAR(1000),
    team_id BIGINT NOT NULL,
    vehicle_id BIGINT,
    driver_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_sessions_team_id ON sessions(team_id);
CREATE INDEX idx_sessions_date ON sessions(session_date);
CREATE INDEX idx_sessions_vehicle ON sessions(vehicle_id);
CREATE INDEX idx_sessions_driver ON sessions(driver_id);

CREATE TABLE lap_times (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL,
    lap_number INTEGER NOT NULL CHECK (lap_number >= 1),
    lap_time_ms BIGINT NOT NULL CHECK (lap_time_ms >= 1),
    sector_1_ms BIGINT,
    sector_2_ms BIGINT,
    sector_3_ms BIGINT,
    valid BOOLEAN NOT NULL DEFAULT TRUE,
    compound VARCHAR(20) CHECK (compound IN (
        'SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET', 'SLICK', 'RAIN', 'UNKNOWN'
    )),
    fuel_kg DECIMAL(6, 2),
    notes VARCHAR(500),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    CONSTRAINT uk_session_lap UNIQUE (session_id, lap_number)
);

CREATE INDEX idx_lap_session ON lap_times(session_id);
CREATE INDEX idx_lap_session_number ON lap_times(session_id, lap_number);

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
