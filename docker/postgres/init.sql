-- Script de inicialización para PostgreSQL en Docker
-- Racing Team Management System

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Configurar timezone
SET timezone = 'UTC';

-- Crear esquema si no existe
CREATE SCHEMA IF NOT EXISTS public;

-- Otorgar permisos al usuario
GRANT ALL PRIVILEGES ON SCHEMA public TO racing_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO racing_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO racing_user;

-- Configuraciones de rendimiento para desarrollo
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Base de datos racing_team_db inicializada correctamente';
END $$;