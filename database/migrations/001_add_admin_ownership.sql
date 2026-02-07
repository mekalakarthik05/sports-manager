-- ============================================================
-- Migration: Add admin_id (owner) to events and teams
-- Run after schema.sql on existing DBs.
-- Requires at least one row in admins (create via seedAdmin.js first).
-- ============================================================

-- Events: add admin_id (owner)
ALTER TABLE events ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES admins(id) ON DELETE CASCADE;
UPDATE events SET admin_id = (SELECT id FROM admins LIMIT 1) WHERE admin_id IS NULL;
ALTER TABLE events ALTER COLUMN admin_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_admin ON events(admin_id);

-- Teams: add admin_id (owner)
ALTER TABLE teams ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES admins(id) ON DELETE CASCADE;
UPDATE teams SET admin_id = (SELECT id FROM admins LIMIT 1) WHERE admin_id IS NULL;
ALTER TABLE teams ALTER COLUMN admin_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_teams_admin ON teams(admin_id);
