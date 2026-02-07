/**
 * 1. Reset DB (drop tables/types), 2. Run schema, 3. Seed super admin + test data.
 * Requires: DATABASE_URL in env (or .env).
 * Run from backend/: node scripts/resetAndSeed.js
 */
require('dotenv').config();
const { pool } = require('../src/config/db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const SALT_ROUNDS = 10;
const SUPER_USER = 'admin';
const SUPER_PASS = 'admin@123';
const SUPER_NAME = 'Super Admin';

async function runSqlFile(filename) {
  const fullPath = path.join(__dirname, '..', '..', 'database', filename);
  const sql = fs.readFileSync(fullPath, 'utf8');
  await pool.query(sql);
}

async function reset() {
  console.log('Dropping existing tables and types...');
  await runSqlFile('reset.sql');
  console.log('Creating schema...');
  await runSqlFile('schema.sql');
}

async function seedSuperAdmin() {
  const hash = await bcrypt.hash(SUPER_PASS, SALT_ROUNDS);
  const { rows: ex } = await pool.query('SELECT id FROM admins WHERE username = $1', [SUPER_USER]);
  if (ex.length > 0) {
    await pool.query(
      'UPDATE admins SET password_hash = $1, name = $2, role = $3 WHERE username = $4',
      [hash, SUPER_NAME, 'super_admin', SUPER_USER]
    );
    console.log('Super admin updated:', SUPER_USER);
  } else {
    await pool.query(
      'INSERT INTO admins (name, username, password_hash, role) VALUES ($1, $2, $3, $4)',
      [SUPER_NAME, SUPER_USER, hash, 'super_admin']
    );
    console.log('Super admin created:', SUPER_USER);
  }
  const { rows: r } = await pool.query('SELECT id FROM admins WHERE username = $1', [SUPER_USER]);
  return r[0].id;
}

async function seedTestData(adminId) {
  const start = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + 1);

  const { rows: ev } = await pool.query(
    `INSERT INTO events (admin_id, name, start_date, end_date)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [adminId, 'Test Championship 2025', start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)]
  );
  const eventId = ev[0].id;
  console.log('Event created:', eventId);

  const teamNames = ['Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta'];
  const teamIds = [];
  for (const name of teamNames) {
    const { rows: t } = await pool.query(
      'INSERT INTO teams (admin_id, name) VALUES ($1, $2) RETURNING id',
      [adminId, name]
    );
    teamIds.push(t[0].id);
  }
  console.log('4 teams created');

  for (const teamId of teamIds) {
    await pool.query('INSERT INTO event_teams (event_id, team_id) VALUES ($1, $2)', [eventId, teamId]);
  }
  console.log('Teams mapped to event');

  const { rows: s1 } = await pool.query(
    `INSERT INTO sports (event_id, category, name, playoff_format) VALUES ($1, 'men', 'Cricket', 'ipl') RETURNING id`,
    [eventId]
  );
  const { rows: s2 } = await pool.query(
    `INSERT INTO sports (event_id, category, name, playoff_format) VALUES ($1, 'women', 'Volleyball', 'knockout') RETURNING id`,
    [eventId]
  );
  const sport1Id = s1[0].id;
  const sport2Id = s2[0].id;
  console.log('2 sports created');

  for (const teamId of teamIds) {
    await pool.query(
      `INSERT INTO sport_points_table (sport_id, team_id, matches_played, wins, losses, points) VALUES ($1, $2, 0, 0, 0, 0)`,
      [sport1Id, teamId]
    );
    await pool.query(
      `INSERT INTO event_points_table (event_id, team_id, gold, silver, bronze, total_points) VALUES ($1, $2, 0, 0, 0, 0)`,
      [eventId, teamId]
    );
  }
  await pool.query(
    `INSERT INTO sport_points_table (sport_id, team_id, matches_played, wins, losses, points) SELECT $1, team_id, 0, 0, 0, 0 FROM event_teams WHERE event_id = $2`,
    [sport2Id, eventId]
  );
  console.log('Points tables initialized');

  const scheduled = new Date();
  scheduled.setDate(scheduled.getDate() + 1);
  await pool.query(
    `INSERT INTO matches (sport_id, team1_id, team2_id, match_type, scheduled_at, status, team1_score, team2_score, winner_team_id)
     VALUES ($1, $2, $3, 'group', $4, 'completed', '150', '120', $2)`,
    [sport1Id, teamIds[0], teamIds[1], scheduled]
  );
  await pool.query(
    `INSERT INTO matches (sport_id, team1_id, team2_id, match_type, scheduled_at, status)
     VALUES ($1, $2, $3, 'group', $4, 'upcoming')`,
    [sport1Id, teamIds[2], teamIds[3], scheduled]
  );
  console.log('2 matches created (1 completed, 1 upcoming)');

  const { rows: completedMatch } = await pool.query(
    'SELECT * FROM matches WHERE sport_id = $1 AND status = $2 LIMIT 1',
    [sport1Id, 'completed']
  );
  if (completedMatch.length > 0) {
    const pointsService = require('../src/services/pointsService');
    await pointsService.updateSportPointsFromMatch(completedMatch[0]);
    await pointsService.recalculateEventPointsFromSport(sport1Id);
    console.log('Points updated for completed match');
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }
  try {
    await reset();
    const adminId = await seedSuperAdmin();
    await seedTestData(adminId);
    console.log('Done.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

main();
