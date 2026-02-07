const { pool } = require('../config/db');
const matchModel = require('../models/match');
const sportModel = require('../models/sport');
const eventModel = require('../models/event');
const sportPointsModel = require('../models/sportPoints');
const eventPointsModel = require('../models/eventPoints');
const teamModel = require('../models/team');
const ownershipService = require('./ownershipService');

const GOLD_POINTS = 3;
const SILVER_POINTS = 2;
const BRONZE_POINTS = 1;

// Initialize sport points rows for an entire sport (for all teams in the event)
async function initializeSportPoints(sportId) {
  const sport = await sportModel.findById(sportId);
  if (!sport) throw new Error('Sport not found');
  const eventId = sport.event_id;
  const teamIds = await teamModel.getEventTeamIds(eventId);
  for (const teamId of teamIds) {
    await sportPointsModel.upsert(sportId, teamId, {
      matches_played: 0,
      wins: 0,
      losses: 0,
      points: 0,
    });
  }
}

// Initialize sport points entry for a single team across all sports in an event
async function initializeSportPointsForTeamInEvent(eventId, teamId) {
  const sports = await sportModel.findByEventId(eventId);
  for (const s of sports) {
    await sportPointsModel.upsert(s.id, teamId, {
      matches_played: 0,
      wins: 0,
      losses: 0,
      points: 0,
    });
  }
}

// Initialize event points entry for a single team
async function initializeEventPointsForTeam(eventId, teamId) {
  await eventPointsModel.upsert(eventId, teamId, { gold: 0, silver: 0, bronze: 0, total_points: 0 });
}

async function getSportPointsTable(sportId) {
  return sportPointsModel.findBySportId(sportId);
}

async function updateSportPointsRow(sportId, teamId, data, adminIdOrAdmin) {
  await ownershipService.assertSportOwnership(sportId, adminIdOrAdmin);
  return sportPointsModel.upsert(sportId, teamId, data);
}

async function updateSportPointsFromMatch(match) {
  if (match.status !== 'completed' || !match.winner_team_id) return;
  const sportId = match.sport_id;
  const loserId =
    match.winner_team_id === match.team1_id ? match.team2_id : match.team1_id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: winnerRow } = await client.query(
      'SELECT * FROM sport_points_table WHERE sport_id = $1 AND team_id = $2',
      [sportId, match.winner_team_id]
    );
    const { rows: loserRow } = await client.query(
      'SELECT * FROM sport_points_table WHERE sport_id = $1 AND team_id = $2',
      [sportId, loserId]
    );

    const winner = winnerRow[0];
    const loser = loserRow[0];

    const winnerData = winner
      ? {
          matches_played: winner.matches_played + 1,
          wins: winner.wins + 1,
          losses: winner.losses,
          points: winner.points + 2,
        }
      : {
          matches_played: 1,
          wins: 1,
          losses: 0,
          points: 2,
        };

    const loserData = loser
      ? {
          matches_played: loser.matches_played + 1,
          wins: loser.wins,
          losses: loser.losses + 1,
          points: loser.points,
        }
      : {
          matches_played: 1,
          wins: 0,
          losses: 1,
          points: 0,
        };

    await client.query(
      `INSERT INTO sport_points_table (sport_id, team_id, matches_played, wins, losses, points)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (sport_id, team_id) DO UPDATE SET
         matches_played = EXCLUDED.matches_played,
         wins = EXCLUDED.wins,
         losses = EXCLUDED.losses,
         points = EXCLUDED.points`,
      [
        sportId,
        match.winner_team_id,
        winnerData.matches_played,
        winnerData.wins,
        winnerData.losses,
        winnerData.points,
      ]
    );

    await client.query(
      `INSERT INTO sport_points_table (sport_id, team_id, matches_played, wins, losses, points)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (sport_id, team_id) DO UPDATE SET
         matches_played = EXCLUDED.matches_played,
         wins = EXCLUDED.wins,
         losses = EXCLUDED.losses,
         points = EXCLUDED.points`,
      [
        sportId,
        loserId,
        loserData.matches_played,
        loserData.wins,
        loserData.losses,
        loserData.points,
      ]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getEventPointsTable(eventId) {
  return eventPointsModel.findByEventId(eventId);
}

async function recalculateEventPointsFromSport(sportId) {
  const sport = await sportModel.findById(sportId);
  if (!sport) return;
  const eventId = sport.event_id;
  const allSports = await sportModel.findByEventId(eventId);

  const gold = new Map();
  const silver = new Map();
  const bronze = new Map();

  // Determine medal counts based purely on completed playoff matches
  for (const s of allSports) {
    const completedMatches = await matchModel.findBySportId(s.id, {
      status: 'completed',
    });
    for (const m of completedMatches) {
      if (!m.winner_team_id) continue;
      if (m.match_type === 'final') {
        gold.set(m.winner_team_id, (gold.get(m.winner_team_id) || 0) + 1);
        const loserId = m.winner_team_id === m.team1_id ? m.team2_id : m.team1_id;
        silver.set(loserId, (silver.get(loserId) || 0) + 1);
      } else if (['qualifier1', 'qualifier2', 'semi', 'eliminator'].includes(m.match_type)) {
        const loserId = m.winner_team_id === m.team1_id ? m.team2_id : m.team1_id;
        bronze.set(loserId, (bronze.get(loserId) || 0) + 1);
      }
    }
  }

  const eventTeamIds = await teamModel.getEventTeamIds(eventId);
  const allTeamIds = [...new Set([...gold.keys(), ...silver.keys(), ...bronze.keys(), ...eventTeamIds])];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const teamId of allTeamIds) {
      const g = gold.get(teamId) || 0;
      const s = silver.get(teamId) || 0;
      const b = bronze.get(teamId) || 0;
      const total = g * GOLD_POINTS + s * SILVER_POINTS + b * BRONZE_POINTS;

      await client.query(
        `INSERT INTO event_points_table (event_id, team_id, gold, silver, bronze, total_points)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (event_id, team_id) DO UPDATE SET
           gold = EXCLUDED.gold,
           silver = EXCLUDED.silver,
           bronze = EXCLUDED.bronze,
           total_points = EXCLUDED.total_points`,
        [eventId, teamId, g, s, b, total]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  getSportPointsTable,
  updateSportPointsRow,
  updateSportPointsFromMatch,
  getEventPointsTable,
  recalculateEventPointsFromSport,
  initializeSportPoints,
  initializeSportPointsForTeamInEvent,
  initializeEventPointsForTeam,
};
