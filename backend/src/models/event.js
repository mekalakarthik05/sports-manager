const { pool } = require('../config/db');

async function findAll(opts = {}) {
  const order = opts.orderBy === 'date' ? 'start_date DESC' : 'created_at DESC';
  const { adminId, search } = opts;
  let query = `SELECT id, admin_id, name, banner_url, start_date, end_date, created_at, updated_at FROM events`;
  const params = [];
  const conditions = [];
  if (adminId) {
    conditions.push('admin_id = $' + (params.length + 1));
    params.push(adminId);
  }
  if (search && String(search).trim()) {
    conditions.push('name ILIKE $' + (params.length + 1));
    params.push('%' + String(search).trim() + '%');
  }
  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ` ORDER BY ${order}`;
  const { rows } = params.length ? await pool.query(query, params) : await pool.query(query);
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, admin_id, name, banner_url, start_date, end_date, created_at, updated_at FROM events WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function getSportsCount(eventId) {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS count FROM sports WHERE event_id = $1',
    [eventId]
  );
  return rows[0].count;
}

async function create(data) {
  const { admin_id, name, banner_url, start_date, end_date } = data;
  const { rows } = await pool.query(
    `INSERT INTO events (admin_id, name, banner_url, start_date, end_date)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, admin_id, name, banner_url, start_date, end_date, created_at, updated_at`,
    [admin_id, name, banner_url || null, start_date, end_date]
  );
  return rows[0];
}

async function update(id, data) {
  const { name, banner_url, start_date, end_date } = data;
  const { rows } = await pool.query(
    `UPDATE events SET name = COALESCE($2, name), banner_url = COALESCE($3, banner_url),
     start_date = COALESCE($4, start_date), end_date = COALESCE($5, end_date)
     WHERE id = $1 RETURNING id, name, banner_url, start_date, end_date, created_at, updated_at`,
    [id, name, banner_url, start_date, end_date]
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM events WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { findAll, findById, getSportsCount, create, update, remove };
