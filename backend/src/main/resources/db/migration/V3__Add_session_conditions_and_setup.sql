-- Migración V3: condiciones ambientales y notas de setup por sesión
-- Foco técnico: permite correlacionar tiempos con temperatura, humedad,
-- viento y la configuración del vehículo en esa sesión.

ALTER TABLE sessions ADD COLUMN track_temp_c   DECIMAL(4, 1);
ALTER TABLE sessions ADD COLUMN ambient_temp_c DECIMAL(4, 1);
ALTER TABLE sessions ADD COLUMN humidity_pct   SMALLINT CHECK (humidity_pct BETWEEN 0 AND 100);
ALTER TABLE sessions ADD COLUMN wind_kph       DECIMAL(5, 1);
-- Setup como JSON flexible (presiones, gearing, aero, balance...).
-- Texto plano para evitar enredos con jsonb-vs-json en distintos drivers.
ALTER TABLE sessions ADD COLUMN setup_notes    TEXT;
