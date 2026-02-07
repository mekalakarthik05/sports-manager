-- Reset database: drop all tables and types (safe if missing).
-- Run: psql "$DATABASE_URL" -f database/reset.sql
-- Then: psql "$DATABASE_URL" -f database/schema.sql

DROP TABLE IF EXISTS event_points_table CASCADE;
DROP TABLE IF EXISTS sport_points_table CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS event_teams CASCADE;
DROP TABLE IF EXISTS sports CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

DROP TYPE IF EXISTS match_status CASCADE;
DROP TYPE IF EXISTS match_type_enum CASCADE;
DROP TYPE IF EXISTS playoff_format CASCADE;
DROP TYPE IF EXISTS sport_category CASCADE;

DROP FUNCTION IF EXISTS set_updated_at() CASCADE;
