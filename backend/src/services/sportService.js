const ApiError = require('../utils/ApiError');
const sportModel = require('../models/sport');
const eventModel = require('../models/event');
const playoffService = require('./playoffService');
const ownershipService = require('./ownershipService');
const pointsService = require('./pointsService');

async function listByEvent(eventId, opts = {}) {
  validateId(eventId);
  const event = await eventModel.findById(eventId);
  if (!event) throw new ApiError(404, 'Event not found');
  return sportModel.findByEventId(eventId, opts);
}

async function getById(id) {
  validateId(id);
  const sport = await sportModel.findById(id);
  if (!sport) throw new ApiError(404, 'Sport not found');
  return sport;
}

async function create(data, adminIdOrAdmin) {
  const { event_id, category, name, playoff_format } = data;
  if (!event_id || !category || !name) {
    throw new ApiError(400, 'event_id, category, name required');
  }
  if (typeof name !== 'string' || !name.trim()) {
    throw new ApiError(400, 'Sport name must be a non-empty string');
  }
  if (!['men', 'women'].includes(category)) {
    throw new ApiError(400, 'Category must be "men" or "women"');
  }
  if (playoff_format && !['knockout', 'ipl', 'wpl'].includes(playoff_format)) {
    throw new ApiError(400, 'Playoff format must be "knockout", "ipl", or "wpl"');
  }
  await ownershipService.assertEventOwnership(event_id, adminIdOrAdmin);
  
  // Check for duplicate sport in same event/category
  const existing = await sportModel.findByEventId(event_id, { category });
  if (existing.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
    throw new ApiError(409, `Sport "${name}" already exists in ${category} category for this event`);
  }
  
  const sport = await sportModel.create({
    event_id,
    category,
    name: name.trim(),
    playoff_format: playoff_format || 'knockout',
  });
  // map event teams into sport_teams and initialize sport-level points rows
  try {
    const teamIds = await (require('../models/team')).getEventTeamIds(event_id);
    const sportTeamsModel = require('../models/sportTeams');
    for (const tid of teamIds) {
      await sportTeamsModel.addMapping(sport.id, tid);
    }
    await pointsService.initializeSportPoints(sport.id);
  } catch (err) {
    // non-fatal: log and continue
    console.warn('Failed to initialize sport mappings/points for sport', sport.id, err.message || err);
  }
  return sport;
}

async function update(id, data, adminIdOrAdmin) {
  validateId(id);
  await ownershipService.assertSportOwnership(id, adminIdOrAdmin);
  const updated = await sportModel.update(id, data);
  if (!updated) throw new ApiError(404, 'Sport not found');
  return updated;
}

async function remove(id, adminIdOrAdmin) {
  validateId(id);
  await ownershipService.assertSportOwnership(id, adminIdOrAdmin);
  const deleted = await sportModel.remove(id);
  if (!deleted) throw new ApiError(404, 'Sport not found');
  return { deleted: true };
}

async function generatePlayoffs(sportId, adminIdOrAdmin) {
  await ownershipService.assertSportOwnership(sportId, adminIdOrAdmin);
  const sport = await getById(sportId);
  return playoffService.generatePlayoffMatches(sport);
}

function validateId(id) {
  if (!id) throw new ApiError(400, 'Sport id required');
}

module.exports = {
  listByEvent,
  getById,
  create,
  update,
  remove,
  generatePlayoffs,
  listTeams: async function (sportId) {
    const st = require('../models/sportTeams');
    return st.listBySport(sportId);
  },
};
