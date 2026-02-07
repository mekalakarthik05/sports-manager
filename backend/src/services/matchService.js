const ApiError = require('../utils/ApiError');
const matchModel = require('../models/match');
const sportModel = require('../models/sport');
const teamModel = require('../models/team');
const sportPointsModel = require('../models/sportPoints');
const pointsService = require('./pointsService');
const playoffService = require('./playoffService');
const ownershipService = require('./ownershipService');

async function listBySport(sportId, opts = {}) {
  validateId(sportId);
  const sport = await sportModel.findById(sportId);
  if (!sport) throw new ApiError(404, 'Sport not found');
  return matchModel.findBySportId(sportId, opts);
}

async function getById(id) {
  validateId(id);
  const match = await matchModel.findById(id);
  if (!match) throw new ApiError(404, 'Match not found');
  return match;
}

async function create(data, adminIdOrAdmin) {
  const { sport_id, team1_id, team2_id, match_type, scheduled_at, status, live_stream_url } = data;
  if (!sport_id || !team1_id || !team2_id) {
    throw new ApiError(400, 'sport_id, team1_id, team2_id required');
  }
  if (team1_id === team2_id) {
    throw new ApiError(400, 'team1 and team2 must be different');
  }
  
  // Validate match_type
  const validTypes = ['group', 'qualifier1', 'eliminator', 'qualifier2', 'semi', 'final'];
  if (match_type && !validTypes.includes(match_type)) {
    throw new ApiError(400, `Invalid match_type. Must be one of: ${validTypes.join(', ')}`);
  }
  
  // Validate status
  if (status && !['upcoming', 'live', 'completed'].includes(status)) {
    throw new ApiError(400, 'Status must be "upcoming", "live", or "completed"');
  }
  
  // Validate live_stream_url is a valid URL if provided
  if (live_stream_url && typeof live_stream_url === 'string') {
    try {
      new URL(live_stream_url);
    } catch (err) {
      throw new ApiError(400, 'Invalid live_stream_url format');
    }
  }
  // Ensure the teams belong to the same event as the sport
  const sport = await sportModel.findById(sport_id);
  if (!sport) throw new ApiError(404, 'Sport not found');
  const eventTeamIds = await teamModel.getEventTeamIds(sport.event_id);
  if (!eventTeamIds.includes(team1_id) || !eventTeamIds.includes(team2_id)) {
    throw new ApiError(400, 'Both teams must belong to the event');
  }

  await ownershipService.assertMatchOwnershipViaSport(sport_id, adminIdOrAdmin);

  // Ensure sport points rows exist for both teams
  await sportPointsModel.upsert(sport_id, team1_id, { matches_played: 0, wins: 0, losses: 0, points: 0 });
  await sportPointsModel.upsert(sport_id, team2_id, { matches_played: 0, wins: 0, losses: 0, points: 0 });

  const match = await matchModel.create({
    sport_id,
    team1_id,
    team2_id,
    match_type: match_type || 'group',
    scheduled_at: scheduled_at || null,
    status: status || 'upcoming',
    live_stream_url: live_stream_url || null,
  });
  return match;
}

async function update(id, data, adminIdOrAdmin) {
  validateId(id);
  const existing = await getById(id);
  await ownershipService.assertMatchOwnershipViaSport(existing.sport_id, adminIdOrAdmin);
  
  // Validate input data
  if (data.status && !['upcoming', 'live', 'completed'].includes(data.status)) {
    throw new ApiError(400, 'Status must be "upcoming", "live", or "completed"');
  }
  if (data.winner_team_id && ![existing.team1_id, existing.team2_id].includes(data.winner_team_id)) {
    throw new ApiError(400, 'Winner must be one of the match teams');
  }
  if (data.live_stream_url && typeof data.live_stream_url === 'string') {
    try {
      new URL(data.live_stream_url);
    } catch (err) {
      throw new ApiError(400, 'Invalid live_stream_url format');
    }
  }
  
  const updated = await matchModel.update(id, data);
  if (!updated) throw new ApiError(404, 'Match not found');

  if (data.status === 'completed' && data.winner_team_id) {
    await pointsService.updateSportPointsFromMatch(updated);
    await pointsService.recalculateEventPointsFromSport(existing.sport_id);
    // Advance playoffs (create next-stage matches like Qualifier 2 / Finals) if needed
    await playoffService.advancePlayoffsIfNeeded(updated);
  }

  return updated;
}

async function remove(id, adminIdOrAdmin) {
  validateId(id);
  const match = await getById(id);
  await ownershipService.assertMatchOwnershipViaSport(match.sport_id, adminIdOrAdmin);
  const deleted = await matchModel.remove(id);
  if (!deleted) throw new ApiError(404, 'Match not found');
  await pointsService.recalculateEventPointsFromSport(match.sport_id);
  return { deleted: true };
}

async function getPlayoffs(sportId) {
  const sport = await sportModel.findById(sportId);
  if (!sport) throw new ApiError(404, 'Sport not found');
  return playoffService.getPlayoffMatches(sportId);
}

function validateId(id) {
  if (!id) throw new ApiError(400, 'Match id required');
}

module.exports = {
  listBySport,
  getById,
  create,
  update,
  remove,
  getPlayoffs,
};
