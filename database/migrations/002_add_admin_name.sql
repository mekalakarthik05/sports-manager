-- Add optional display name for admins (multi-admin support).
-- Safe for existing DBs: adds column with default.
ALTER TABLE admins ADD COLUMN IF NOT EXISTS name VARCHAR(255) DEFAULT '' NOT NULL;
