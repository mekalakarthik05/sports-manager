const { pool } = require('../config/db');

async function findByUsername(username) {
  const { rows } = await pool.query(
    'SELECT id, name, username, password_hash, role, created_at, updated_at FROM admins WHERE username = $1',
    [username]
  );
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, name, username, role, created_at FROM admins WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function create(username, passwordHash, name = '', role = 'admin') {
  const { rows } = await pool.query(
    'INSERT INTO admins (username, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, name, username, role, created_at',
    [username, passwordHash, (name || '').trim() || username, role]
  );
  return rows[0];
}

module.exports = { findByUsername, findById, create };
