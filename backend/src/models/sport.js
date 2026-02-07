const { pool } = require('../config/db');

async function findByEventId(eventId, opts = {}) {
  const { category, search } = opts;
  let query =
    'SELECT id, event_id, category, name, playoff_format, created_at, updated_at FROM sports WHERE event_id = $1';
  const params = [eventId];
  let idx = 2;
  if (category) {
    query += ' AND category = $' + idx;
    params.push(category);
    idx++;
  }
  if (search && String(search).trim()) {
    query += ' AND name ILIKE $' + idx;
    params.push('%' + String(search).trim() + '%');
    idx++;
  }
  query += ' ORDER BY category, name';
  const { rows } = await pool.query(query, params);
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, event_id, category, name, playoff_format, created_at, updated_at FROM sports WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function create(data) {
  const { event_id, category, name, playoff_format } = data;
  const { rows } = await pool.query(
    `INSERT INTO sports (event_id, category, name, playoff_format)
     VALUES ($1, $2, $3, $4) RETURNING id, event_id, category, name, playoff_format, created_at, updated_at`,
    [event_id, category, name, playoff_format || 'knockout']
  );
  return rows[0];
}

async function update(id, data) {
  const { category, name, playoff_format } = data;
  const { rows } = await pool.query(
    `UPDATE sports SET category = COALESCE($2, category), name = COALESCE($3, name),
     playoff_format = COALESCE($4, playoff_format) WHERE id = $1
     RETURNING id, event_id, category, name, playoff_format, created_at, updated_at`,
    [id, category, name, playoff_format]
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM sports WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { findByEventId, findById, create, update, remove };
