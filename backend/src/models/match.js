const { pool } = require('../config/db');

async function findBySportId(sportId, opts = {}) {
  const { status, type, search } = opts;
  let query = `
    SELECT m.id, m.sport_id, m.team1_id, m.team2_id, m.match_type, m.scheduled_at, m.status,
           m.winner_team_id, m.team1_score, m.team2_score, m.live_stream_url, m.created_at, m.updated_at,
           t1.name AS team1_name, t1.logo_url AS team1_logo,
           t2.name AS team2_name, t2.logo_url AS team2_logo,
           tw.name AS winner_name
    FROM matches m
    JOIN teams t1 ON t1.id = m.team1_id
    JOIN teams t2 ON t2.id = m.team2_id
    LEFT JOIN teams tw ON tw.id = m.winner_team_id
    WHERE m.sport_id = $1`;
  const params = [sportId];
  let idx = 2;
  if (status) {
    query += ` AND m.status = $${idx}`;
    params.push(status);
    idx++;
  }
  if (type) {
    query += ` AND m.match_type = $${idx}`;
    params.push(type);
    idx++;
  }
  if (search && String(search).trim()) {
    const term = '%' + String(search).trim() + '%';
    query += ` AND (t1.name ILIKE $${idx} OR t2.name ILIKE $${idx})`;
    params.push(term);
    idx++;
  }
  query += ' ORDER BY m.scheduled_at ASC NULLS LAST, m.created_at ASC';
  const { rows } = await pool.query(query, params);
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT m.id, m.sport_id, m.team1_id, m.team2_id, m.match_type, m.scheduled_at, m.status,
            m.winner_team_id, m.team1_score, m.team2_score, m.live_stream_url, m.created_at, m.updated_at,
            t1.name AS team1_name, t1.logo_url AS team1_logo,
            t2.name AS team2_name, t2.logo_url AS team2_logo,
            tw.name AS winner_name
     FROM matches m
     JOIN teams t1 ON t1.id = m.team1_id
     JOIN teams t2 ON t2.id = m.team2_id
     LEFT JOIN teams tw ON tw.id = m.winner_team_id
     WHERE m.id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function create(data) {
  const {
    sport_id,
    team1_id,
    team2_id,
    match_type,
    scheduled_at,
    status,
    live_stream_url,
  } = data;
  const { rows } = await pool.query(
    `INSERT INTO matches (sport_id, team1_id, team2_id, match_type, scheduled_at, status, live_stream_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, sport_id, team1_id, team2_id, match_type, scheduled_at, status, winner_team_id,
               team1_score, team2_score, live_stream_url, created_at, updated_at`,
    [
      sport_id,
      team1_id,
      team2_id,
      match_type || 'group',
      scheduled_at || null,
      status || 'upcoming',
      live_stream_url || null,
    ]
  );
  return rows[0];
}

async function update(id, data) {
  const fields = [];
  const values = [id];
  let idx = 2;
  const allowed = [
    'scheduled_at',
    'status',
    'winner_team_id',
    'team1_score',
    'team2_score',
    'live_stream_url',
  ];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${idx}`);
      values.push(data[key]);
      idx++;
    }
  }
  if (fields.length === 0) return findById(id);
  const { rows } = await pool.query(
    `UPDATE matches SET ${fields.join(', ')} WHERE id = $1
     RETURNING id, sport_id, team1_id, team2_id, match_type, scheduled_at, status, winner_team_id,
               team1_score, team2_score, live_stream_url, created_at, updated_at`,
    values
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM matches WHERE id = $1', [id]);
  return rowCount > 0;
}

async function getBySportAndType(sportId, matchType) {
  const { rows } = await pool.query(
    'SELECT id, sport_id, team1_id, team2_id, match_type, scheduled_at, status, winner_team_id, team1_score, team2_score FROM matches WHERE sport_id = $1 AND match_type = $2',
    [sportId, matchType]
  );
  return rows;
}

module.exports = {
  findBySportId,
  findById,
  create,
  update,
  remove,
  getBySportAndType,
};
