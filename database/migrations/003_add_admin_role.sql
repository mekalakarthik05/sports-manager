-- Add role column for super_admin vs admin.
-- super_admin: can view/edit/delete all events. admin: only own resources.
ALTER TABLE admins ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'admin';
UPDATE admins SET role = 'admin' WHERE role IS NULL;
ALTER TABLE admins ALTER COLUMN role SET NOT NULL;
ALTER TABLE admins ALTER COLUMN role SET DEFAULT 'admin';
