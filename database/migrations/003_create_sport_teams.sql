-- Migration 003: create sport_teams mapping table
BEGIN;

CREATE TABLE IF NOT EXISTS sport_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(sport_id, team_id)
);

CREATE INDEX IF NOT EXISTS idx_sport_teams_sport ON sport_teams(sport_id);

COMMIT;
