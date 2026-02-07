/**
 * Seeds super admin and optionally a custom admin.
 * Super admin: username=admin, password=admin@123, role=super_admin (unique, system-level).
 * Run: node scripts/seedAdmin.js
 * Optional: INITIAL_ADMIN_NAME=... INITIAL_ADMIN_USER=... INITIAL_ADMIN_PASS=... for a second admin.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');

const SALT_ROUNDS = 10;
const SUPER_ADMIN_USERNAME = 'admin';
const SUPER_ADMIN_PASSWORD = 'admin@123';
const SUPER_ADMIN_NAME = 'Super Admin';

async function ensureRoleColumn() {
  try {
    await pool.query(`
      ALTER TABLE admins ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'admin';
      UPDATE admins SET role = 'admin' WHERE role IS NULL;
    `);
  } catch (e) {
    // column may already exist with constraint
  }
}

async function seed() {
  await ensureRoleColumn();

  const superAdminHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, SALT_ROUNDS);

  const { rows: existing } = await pool.query(
    'SELECT id, role FROM admins WHERE username = $1',
    [SUPER_ADMIN_USERNAME]
  );

  if (existing.length > 0) {
    await pool.query(
      'UPDATE admins SET password_hash = $1, name = $2, role = $3 WHERE username = $4',
      [superAdminHash, SUPER_ADMIN_NAME, 'super_admin', SUPER_ADMIN_USERNAME]
    );
    console.log('Super admin updated:', SUPER_ADMIN_USERNAME);
  } else {
    await pool.query(
      `INSERT INTO admins (name, username, password_hash, role) VALUES ($1, $2, $3, $4)`,
      [SUPER_ADMIN_NAME, SUPER_ADMIN_USERNAME, superAdminHash, 'super_admin']
    );
    console.log('Super admin created:', SUPER_ADMIN_USERNAME);
  }

  const customUser = process.env.INITIAL_ADMIN_USER;
  const customPass = process.env.INITIAL_ADMIN_PASS;
  const customName = process.env.INITIAL_ADMIN_NAME || 'Admin';

  if (customUser && customUser.trim() !== '' && customUser.toLowerCase() !== 'admin' && customPass) {
    const { rows: r } = await pool.query('SELECT id FROM admins WHERE username = $1', [customUser.trim()]);
    if (r.length === 0) {
      const hash = await bcrypt.hash(customPass, SALT_ROUNDS);
      await pool.query(
        'INSERT INTO admins (name, username, password_hash, role) VALUES ($1, $2, $3, $4)',
        [customName, customUser.trim(), hash, 'admin']
      );
      console.log('Created admin:', customUser);
    } else {
      console.log('Admin already exists:', customUser);
    }
  }

  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
