const ApiError = require('../utils/ApiError');
const eventModel = require('../models/event');
const teamModel = require('../models/team');
const sportModel = require('../models/sport');

function isSuperAdmin(admin) {
  return admin && admin.role === 'super_admin';
}

async function assertEventOwnership(eventId, adminIdOrAdmin) {
  const event = await eventModel.findById(eventId);
  if (!event) throw new ApiError(404, 'Event not found');
  const admin = typeof adminIdOrAdmin === 'object' ? adminIdOrAdmin : { id: adminIdOrAdmin, role: 'admin' };
  if (isSuperAdmin(admin)) return event;
  if (event.admin_id !== admin.id) {
    throw new ApiError(403, 'You do not have access to this event');
  }
  return event;
}

async function assertTeamOwnership(teamId, adminIdOrAdmin) {
  const team = await teamModel.findById(teamId);
  if (!team) throw new ApiError(404, 'Team not found');
  const admin = typeof adminIdOrAdmin === 'object' ? adminIdOrAdmin : { id: adminIdOrAdmin, role: 'admin' };
  if (isSuperAdmin(admin)) return team;
  if (team.admin_id !== admin.id) {
    throw new ApiError(403, 'You do not have access to this team');
  }
  return team;
}

async function assertSportOwnership(sportId, adminIdOrAdmin) {
  const sport = await sportModel.findById(sportId);
  if (!sport) throw new ApiError(404, 'Sport not found');
  const admin = typeof adminIdOrAdmin === 'object' ? adminIdOrAdmin : { id: adminIdOrAdmin, role: 'admin' };
  if (isSuperAdmin(admin)) return sport;
  const event = await eventModel.findById(sport.event_id);
  if (!event || event.admin_id !== admin.id) {
    throw new ApiError(403, 'You do not have access to this sport');
  }
  return sport;
}

async function assertMatchOwnershipViaSport(sportId, adminIdOrAdmin) {
  const sport = await sportModel.findById(sportId);
  if (!sport) throw new ApiError(404, 'Sport not found');
  const admin = typeof adminIdOrAdmin === 'object' ? adminIdOrAdmin : { id: adminIdOrAdmin, role: 'admin' };
  if (isSuperAdmin(admin)) return sport;
  const event = await eventModel.findById(sport.event_id);
  if (!event || event.admin_id !== admin.id) {
    throw new ApiError(403, 'You do not have access to this match');
  }
  return sport;
}

module.exports = {
  assertEventOwnership,
  assertTeamOwnership,
  assertSportOwnership,
  assertMatchOwnershipViaSport,
};
