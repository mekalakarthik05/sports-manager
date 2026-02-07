const { pool } = require('../config/db');

async function findByEventId(eventId) {
  const { rows } = await pool.query(
    `SELECT ept.id, ept.event_id, ept.team_id, ept.gold, ept.silver, ept.bronze, ept.total_points, ept.updated_at,
            t.name AS team_name, t.logo_url AS team_logo
     FROM event_points_table ept
     JOIN teams t ON t.id = ept.team_id
     WHERE ept.event_id = $1
     ORDER BY ept.total_points DESC`,
    [eventId]
  );
  return rows;
}

async function upsert(eventId, teamId, data) {
  const { gold, silver, bronze, total_points } = data;
  const { rows } = await pool.query(
    `INSERT INTO event_points_table (event_id, team_id, gold, silver, bronze, total_points)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (event_id, team_id) DO UPDATE SET
       gold = EXCLUDED.gold,
       silver = EXCLUDED.silver,
       bronze = EXCLUDED.bronze,
       total_points = EXCLUDED.total_points
     RETURNING id, event_id, team_id, gold, silver, bronze, total_points, updated_at`,
    [eventId, teamId, gold ?? 0, silver ?? 0, bronze ?? 0, total_points ?? 0]
  );
  return rows[0];
}

async function removeByEventId(eventId) {
  const { rowCount } = await pool.query('DELETE FROM event_points_table WHERE event_id = $1', [
    eventId,
  ]);
  return rowCount;
}

module.exports = { findByEventId, upsert, removeByEventId };
