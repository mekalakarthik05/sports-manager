const { pool } = require('../config/db');

async function findBySportId(sportId) {
  const { rows } = await pool.query(
    `SELECT spt.id, spt.sport_id, spt.team_id, spt.matches_played, spt.wins, spt.losses, spt.points, spt.updated_at,
            t.name AS team_name, t.logo_url AS team_logo
     FROM sport_points_table spt
     JOIN teams t ON t.id = spt.team_id
     WHERE spt.sport_id = $1
     ORDER BY spt.points DESC`,
    [sportId]
  );
  return rows;
}

async function upsert(sportId, teamId, data) {
  const { matches_played, wins, losses, points } = data;
  const { rows } = await pool.query(
    `INSERT INTO sport_points_table (sport_id, team_id, matches_played, wins, losses, points)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (sport_id, team_id) DO UPDATE SET
       matches_played = EXCLUDED.matches_played,
       wins = EXCLUDED.wins,
       losses = EXCLUDED.losses,
       points = EXCLUDED.points
     RETURNING id, sport_id, team_id, matches_played, wins, losses, points, updated_at`,
    [
      sportId,
      teamId,
      matches_played ?? 0,
      wins ?? 0,
      losses ?? 0,
      points ?? 0,
    ]
  );
  return rows[0];
}

async function removeBySportId(sportId) {
  const { rowCount } = await pool.query('DELETE FROM sport_points_table WHERE sport_id = $1', [sportId]);
  return rowCount;
}

module.exports = { findBySportId, upsert, removeBySportId };
