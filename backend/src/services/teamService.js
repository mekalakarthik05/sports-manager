const ApiError = require('../utils/ApiError');
const teamModel = require('../models/team');
const eventModel = require('../models/event');
const ownershipService = require('./ownershipService');
const pointsService = require('./pointsService');

async function list(opts = {}) {
  const admin = opts.admin;
  const isSuper = admin && admin.role === 'super_admin';
  return teamModel.findAll({
    admin_id: isSuper ? undefined : (admin ? admin.id : opts.admin_id),
    search: opts.search,
  });
}

async function listByEvent(eventId, opts = {}) {
  validateEventId(eventId);
  const event = await eventModel.findById(eventId);
  if (!event) throw new ApiError(404, 'Event not found');
  return teamModel.findAll({ event_id: eventId, search: opts.search });
}

async function getById(id) {
  validateId(id);
  const team = await teamModel.findById(id);
  if (!team) throw new ApiError(404, 'Team not found');
  return team;
}

async function create(data, adminId) {
  if (!data.name) throw new ApiError(400, 'name required');
  return teamModel.create({ ...data, admin_id: adminId });
}

async function update(id, data, adminIdOrAdmin) {
  validateId(id);
  await ownershipService.assertTeamOwnership(id, adminIdOrAdmin);
  const updated = await teamModel.update(id, data);
  if (!updated) throw new ApiError(404, 'Team not found');
  return updated;
}

async function remove(id, adminIdOrAdmin) {
  validateId(id);
  await ownershipService.assertTeamOwnership(id, adminIdOrAdmin);
  const deleted = await teamModel.remove(id);
  if (!deleted) throw new ApiError(404, 'Team not found');
  return { deleted: true };
}

async function addToEvent(eventId, teamId, adminIdOrAdmin) {
  validateEventId(eventId);
  validateId(teamId);
  await ownershipService.assertEventOwnership(eventId, adminIdOrAdmin);
  await ownershipService.assertTeamOwnership(teamId, adminIdOrAdmin);
  await teamModel.addToEvent(eventId, teamId);
  try {
    await pointsService.initializeEventPointsForTeam(eventId, teamId);
    await pointsService.initializeSportPointsForTeamInEvent(eventId, teamId);
  } catch (err) {
    console.warn('Failed to initialize points after adding team to event', eventId, teamId, err.message || err);
  }
  return { added: true };
}

async function removeFromEvent(eventId, teamId, adminIdOrAdmin) {
  validateEventId(eventId);
  validateId(teamId);
  await ownershipService.assertEventOwnership(eventId, adminIdOrAdmin);
  await teamModel.removeFromEvent(eventId, teamId);
  return { removed: true };
}

function validateId(id) {
  if (!id) throw new ApiError(400, 'Team id required');
}

function validateEventId(id) {
  if (!id) throw new ApiError(400, 'Event id required');
}

module.exports = {
  list,
  listByEvent,
  getById,
  create,
  update,
  remove,
  addToEvent,
  removeFromEvent,
};
