-- Migration 002: remove net_run_rate column from sport_points_table
BEGIN;

-- Drop the index that referenced net_run_rate (if exists)
DROP INDEX IF EXISTS idx_sport_points_rank;

-- Drop the column if present
ALTER TABLE IF EXISTS sport_points_table DROP COLUMN IF EXISTS net_run_rate;

-- Recreate the simplified index ordering by points only
CREATE INDEX IF NOT EXISTS idx_sport_points_rank ON sport_points_table(sport_id, points DESC);

COMMIT;
