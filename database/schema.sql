-- ============================================================
-- Sports Event Manager - PostgreSQL Schema
-- UUID primary keys, strong FKs, cascading deletes, read-optimized
-- ============================================================

-- Enable UUID generation (PostgreSQL 13+ has gen_random_uuid() built-in;
-- for older versions use: CREATE EXTENSION IF NOT EXISTS "uuid-ossp";)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. ADMINS (admin login for management; role: super_admin | admin)
-- ============================================================
CREATE TABLE admins (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username        VARCHAR(100) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(255) NOT NULL DEFAULT '',
    role            VARCHAR(20) NOT NULL DEFAULT 'admin',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_username ON admins(username);

-- ============================================================
-- 2. EVENTS (sports events - landing page list, owned by admin)
-- ============================================================
CREATE TABLE events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id        UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    banner_url      VARCHAR(500),
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_event_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_events_created ON events(created_at DESC);
CREATE INDEX idx_events_admin ON events(admin_id);
CREATE INDEX idx_events_name ON events(name);

-- ============================================================
-- 3. TEAMS (owned by admin, can participate in owner's events)
-- ============================================================
CREATE TABLE teams (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id        UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    logo_url        VARCHAR(500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_teams_name ON teams(name);
CREATE INDEX idx_teams_admin ON teams(admin_id);

-- ============================================================
-- 4. EVENT_TEAMS (teams participating in an event)
-- ============================================================
CREATE TABLE event_teams (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, team_id)
);

CREATE INDEX idx_event_teams_event ON event_teams(event_id);
CREATE INDEX idx_event_teams_team ON event_teams(team_id);

-- ============================================================
-- 5. SPORTS (per event, per category: Men / Women)
-- ============================================================
CREATE TYPE sport_category AS ENUM ('men', 'women');
CREATE TYPE playoff_format AS ENUM ('knockout', 'ipl', 'wpl');

CREATE TABLE sports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    category        sport_category NOT NULL,
    name            VARCHAR(100) NOT NULL,
    playoff_format  playoff_format NOT NULL DEFAULT 'knockout',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, category, name)
);

CREATE INDEX idx_sports_event ON sports(event_id);
CREATE INDEX idx_sports_event_category ON sports(event_id, category);

-- ============================================================
-- 6. MATCHES (fixtures: group + playoff)
-- ============================================================
CREATE TYPE match_status AS ENUM ('upcoming', 'live', 'completed');
CREATE TYPE match_type_enum AS ENUM (
    'group',
    'qualifier1',
    'eliminator',
    'qualifier2',
    'semi',
    'final'
);

CREATE TABLE matches (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id            UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    team1_id            UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    team2_id            UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    match_type          match_type_enum NOT NULL DEFAULT 'group',
    scheduled_at        TIMESTAMPTZ,
    status              match_status NOT NULL DEFAULT 'upcoming',
    winner_team_id      UUID REFERENCES teams(id) ON DELETE SET NULL,
    team1_score         VARCHAR(50),
    team2_score         VARCHAR(50),
    live_stream_url     VARCHAR(500),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_teams_different CHECK (team1_id != team2_id)
);

CREATE INDEX idx_matches_sport ON matches(sport_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_scheduled ON matches(sport_id, scheduled_at);
CREATE INDEX idx_matches_sport_status ON matches(sport_id, status);

-- ============================================================
-- 7. SPORT_POINTS_TABLE (IPL style - per sport, admin-updated)
-- Matches played, Wins, Losses, Points
-- ============================================================
CREATE TABLE sport_points_table (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id        UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    matches_played  INTEGER NOT NULL DEFAULT 0 CHECK (matches_played >= 0),
    wins            INTEGER NOT NULL DEFAULT 0 CHECK (wins >= 0),
    losses          INTEGER NOT NULL DEFAULT 0 CHECK (losses >= 0),
    points          INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(sport_id, team_id)
);

CREATE INDEX idx_sport_points_sport ON sport_points_table(sport_id);
CREATE INDEX idx_sport_points_rank ON sport_points_table(sport_id, points DESC);

-- ============================================================
-- 8. EVENT_POINTS_TABLE (Olympics style - auto-calculated)
-- Gold=3, Silver=2, Bronze=1 → Total points (pre-calculated, stored)
-- ============================================================
CREATE TABLE event_points_table (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    gold            INTEGER NOT NULL DEFAULT 0 CHECK (gold >= 0),
    silver          INTEGER NOT NULL DEFAULT 0 CHECK (silver >= 0),
    bronze          INTEGER NOT NULL DEFAULT 0 CHECK (bronze >= 0),
    total_points    INTEGER NOT NULL DEFAULT 0 CHECK (total_points >= 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, team_id)
);

CREATE INDEX idx_event_points_event ON event_points_table(event_id);
CREATE INDEX idx_event_points_rank ON event_points_table(event_id, total_points DESC);

-- ============================================================
-- Trigger: update updated_at on all tables
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admins_updated_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER event_teams_updated_at BEFORE UPDATE ON event_teams
    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER sports_updated_at BEFORE UPDATE ON sports
    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER sport_points_updated_at BEFORE UPDATE ON sport_points_table
    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER event_points_updated_at BEFORE UPDATE ON event_points_table
    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
