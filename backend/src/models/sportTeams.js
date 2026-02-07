const { pool } = require('../config/db');

async function addMapping(sportId, teamId) {
  const { rows } = await pool.query(
    'INSERT INTO sport_teams (sport_id, team_id) VALUES ($1, $2) ON CONFLICT (sport_id, team_id) DO NOTHING RETURNING id',
    [sportId, teamId]
  );
  return rows[0] || null;
}

async function listBySport(sportId) {
  const { rows } = await pool.query(
    `SELECT st.id, st.sport_id, st.team_id, t.name AS team_name, t.logo_url AS team_logo
     FROM sport_teams st
     JOIN teams t ON t.id = st.team_id
     WHERE st.sport_id = $1
     ORDER BY t.name`,
    [sportId]
  );
  return rows;
}

async function removeBySport(sportId) {
  const { rowCount } = await pool.query('DELETE FROM sport_teams WHERE sport_id = $1', [sportId]);
  return rowCount;
}

module.exports = { addMapping, listBySport, removeBySport };
