-- Corrige humidity_pct: Hibernate mapea Integer → INTEGER, no SMALLINT.
ALTER TABLE sessions ALTER COLUMN humidity_pct TYPE INTEGER;
