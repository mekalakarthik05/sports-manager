const ApiError = require('../utils/ApiError');
const eventModel = require('../models/event');
const sportModel = require('../models/sport');
const eventPointsModel = require('../models/eventPoints');
const ownershipService = require('./ownershipService');

async function list(opts = {}) {
  const events = await eventModel.findAll({ search: opts.search, orderBy: opts.orderBy || 'date' });
  return events;
}

async function listByAdmin(adminIdOrAdmin, opts = {}) {
  const admin = typeof adminIdOrAdmin === 'object' ? adminIdOrAdmin : { id: adminIdOrAdmin, role: 'admin' };
  const isSuper = admin.role === 'super_admin';
  return eventModel.findAll({
    adminId: isSuper ? null : admin.id,
    search: opts.search,
    orderBy: 'date',
  });
}

async function getById(id) {
  validateId(id);
  const event = await eventModel.findById(id);
  if (!event) throw new ApiError(404, 'Event not found');
  return event;
}

async function getDashboard(id) {
  const event = await getById(id);
  const sports = await sportModel.findByEventId(id);
  const sportsCount = sports.length;
  const pointsTable = await eventPointsModel.findByEventId(id);
  return {
    ...event,
    sports,
    sports_count: sportsCount,
    points_table: pointsTable,
  };
}

async function create(data, adminId) {
  if (!data.name || !data.start_date || !data.end_date) {
    throw new ApiError(400, 'name, start_date, end_date required');
  }
  if (new Date(data.end_date) < new Date(data.start_date)) {
    throw new ApiError(400, 'end_date must be >= start_date');
  }
  return eventModel.create({ ...data, admin_id: adminId });
}

async function update(id, data, adminIdOrAdmin) {
  validateId(id);
  await ownershipService.assertEventOwnership(id, adminIdOrAdmin);
  const updated = await eventModel.update(id, data);
  if (!updated) throw new ApiError(404, 'Event not found');
  return updated;
}

async function remove(id, adminIdOrAdmin) {
  validateId(id);
  await ownershipService.assertEventOwnership(id, adminIdOrAdmin);
  const deleted = await eventModel.remove(id);
  if (!deleted) throw new ApiError(404, 'Event not found');
  return { deleted: true };
}

function validateId(id) {
  if (!id) throw new ApiError(400, 'Event id required');
}

module.exports = { list, listByAdmin, getById, getDashboard, create, update, remove };
