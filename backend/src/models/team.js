const { pool } = require('../config/db');

async function findAll(opts = {}) {
  const { event_id, search, admin_id } = opts;
  if (event_id) {
    let query = `SELECT t.id, t.admin_id, t.name, t.logo_url, t.created_at, t.updated_at
       FROM teams t
       INNER JOIN event_teams et ON et.team_id = t.id AND et.event_id = $1`;
    const params = [event_id];
    if (search && String(search).trim()) {
      query += ' AND t.name ILIKE $2';
      params.push('%' + String(search).trim() + '%');
    }
    query += ' ORDER BY t.name';
    const { rows } = await pool.query(query, params);
    return rows;
  }
  if (admin_id != null && admin_id !== '') {
    let q = 'SELECT id, admin_id, name, logo_url, created_at, updated_at FROM teams WHERE admin_id = $1';
    const p = [admin_id];
    if (search && String(search).trim()) {
      q += ' AND name ILIKE $2';
      p.push('%' + String(search).trim() + '%');
    }
    q += ' ORDER BY name';
    const { rows } = await pool.query(q, p);
    return rows;
  }
  if (search) {
    const { rows } = await pool.query(
      `SELECT id, admin_id, name, logo_url, created_at, updated_at FROM teams
       WHERE name ILIKE $1 ORDER BY name`,
      [`%${search}%`]
    );
    return rows;
  }
  const { rows } = await pool.query(
    'SELECT id, admin_id, name, logo_url, created_at, updated_at FROM teams ORDER BY name'
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, admin_id, name, logo_url, created_at, updated_at FROM teams WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function create(data) {
  const { admin_id, name, logo_url } = data;
  const { rows } = await pool.query(
    'INSERT INTO teams (admin_id, name, logo_url) VALUES ($1, $2, $3) RETURNING id, admin_id, name, logo_url, created_at, updated_at',
    [admin_id, name, logo_url || null]
  );
  return rows[0];
}

async function update(id, data) {
  const { name, logo_url } = data;
  const { rows } = await pool.query(
    'UPDATE teams SET name = COALESCE($2, name), logo_url = COALESCE($3, logo_url) WHERE id = $1 RETURNING id, name, logo_url, created_at, updated_at',
    [id, name, logo_url]
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM teams WHERE id = $1', [id]);
  return rowCount > 0;
}

async function addToEvent(eventId, teamId) {
  const { rows } = await pool.query(
    'INSERT INTO event_teams (event_id, team_id) VALUES ($1, $2) ON CONFLICT (event_id, team_id) DO NOTHING RETURNING id',
    [eventId, teamId]
  );
  return rows[0];
}

async function removeFromEvent(eventId, teamId) {
  const { rowCount } = await pool.query(
    'DELETE FROM event_teams WHERE event_id = $1 AND team_id = $2',
    [eventId, teamId]
  );
  return rowCount > 0;
}

async function getEventTeamIds(eventId) {
  const { rows } = await pool.query(
    'SELECT team_id FROM event_teams WHERE event_id = $1',
    [eventId]
  );
  return rows.map((r) => r.team_id);
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  addToEvent,
  removeFromEvent,
  getEventTeamIds,
};
