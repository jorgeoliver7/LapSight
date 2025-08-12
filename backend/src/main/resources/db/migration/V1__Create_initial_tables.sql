-- Migración inicial: Crear tablas principales
-- Racing Team Management System

-- Tabla de equipos
CREATE TABLE teams (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    logo_url VARCHAR(255),
    primary_category VARCHAR(50) NOT NULL CHECK (primary_category IN ('CAR', 'MOTORCYCLE')),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    headquarters_location VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(50),
    role VARCHAR(50) NOT NULL CHECK (role IN ('MANAGER', 'PILOT', 'MECHANIC', 'ENGINEER', 'LOGISTICS', 'FINANCE', 'MEDIA', 'GUEST')),
    license_number VARCHAR(100),
    license_expiry TIMESTAMP,
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(50),
    active BOOLEAN NOT NULL DEFAULT true,
    team_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Tabla de vehículos
CREATE TABLE vehicles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    chassis_number VARCHAR(100),
    engine_number VARCHAR(100),
    registration_number VARCHAR(100),
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    year_manufactured INTEGER,
    total_hours DECIMAL(10,2) DEFAULT 0.00,
    total_kilometers DECIMAL(10,2) DEFAULT 0.00,
    last_maintenance TIMESTAMP,
    next_maintenance_hours DECIMAL(10,2),
    next_maintenance_km DECIMAL(10,2),
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'REPAIR', 'OUT_OF_SERVICE', 'TRANSPORT')),
    notes TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    team_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Tabla de registros de mantenimiento
CREATE TABLE maintenance_records (
    id BIGSERIAL PRIMARY KEY,
    maintenance_date TIMESTAMP NOT NULL,
    description VARCHAR(500) NOT NULL,
    maintenance_type VARCHAR(50) NOT NULL CHECK (maintenance_type IN ('PREVENTIVE', 'CORRECTIVE', 'INSPECTION', 'SETUP', 'UPGRADE', 'SEASONAL', 'POST_EVENT', 'PRE_EVENT')),
    vehicle_hours_at_maintenance DECIMAL(10,2),
    vehicle_km_at_maintenance DECIMAL(10,2),
    cost DECIMAL(10,2),
    parts_replaced TEXT,
    next_maintenance_hours DECIMAL(10,2),
    next_maintenance_km DECIMAL(10,2),
    notes TEXT,
    vehicle_id BIGINT NOT NULL,
    performed_by_user_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabla de eventos
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('RACE', 'TEST', 'PRACTICE', 'QUALIFYING', 'TRAINING', 'TRAVEL', 'MEETING', 'MAINTENANCE', 'PRESENTATION', 'MEDIA', 'SPONSOR_EVENT', 'SHAKEDOWN', 'TRACKDAY', 'OTHER')),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    location VARCHAR(255),
    circuit_name VARCHAR(255),
    address TEXT,
    coordinates VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED', 'WEATHER_DELAY', 'TECHNICAL_ISSUE')),
    external_calendar_id VARCHAR(255),
    weather_conditions VARCHAR(255),
    notes TEXT,
    budget_allocated DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    team_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    CONSTRAINT check_event_dates CHECK (end_date >= start_date)
);

-- Tabla de participantes en eventos (many-to-many)
CREATE TABLE event_participants (
    event_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    PRIMARY KEY (event_id, user_id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de vehículos en eventos (many-to-many)
CREATE TABLE event_vehicles (
    event_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    PRIMARY KEY (event_id, vehicle_id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_users_team_id ON users(team_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_vehicles_team_id ON vehicles(team_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_type ON vehicles(vehicle_type);

CREATE INDEX idx_maintenance_vehicle_id ON maintenance_records(vehicle_id);
CREATE INDEX idx_maintenance_date ON maintenance_records(maintenance_date);
CREATE INDEX idx_maintenance_type ON maintenance_records(maintenance_type);

CREATE INDEX idx_events_team_id ON events(team_id);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_type ON events(event_type);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_records_updated_at BEFORE UPDATE ON maintenance_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();