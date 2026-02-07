const asyncHandler = require('../utils/asyncHandler');
const eventService = require('../services/eventService');
const eventModel = require('../models/event');

const list = asyncHandler(async (req, res) => {
  const events = await eventService.list({ search: req.query.search, orderBy: 'date' });
  const withCounts = await Promise.all(
    events.map(async (e) => {
      const sportsCount = await eventModel.getSportsCount(e.id);
      const { admin_id, ...rest } = e;
      return { ...rest, sports_count: sportsCount };
    })
  );
  res.json({ success: true, data: withCounts });
});

const getById = asyncHandler(async (req, res) => {
  const event = await eventService.getById(req.params.eventId);
  const { admin_id, ...rest } = event;
  res.json({ success: true, data: rest });
});

const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await eventService.getDashboard(req.params.eventId);
  const { admin_id, ...rest } = dashboard;
  res.json({ success: true, data: rest });
});

const create = asyncHandler(async (req, res) => {
  const event = await eventService.create(req.body, req.admin.id);
  res.status(201).json({ success: true, data: event });
});

const update = asyncHandler(async (req, res) => {
  const event = await eventService.update(req.params.eventId, req.body, req.admin);
  res.json({ success: true, data: event });
});

const remove = asyncHandler(async (req, res) => {
  await eventService.remove(req.params.eventId, req.admin);
  res.json({ success: true, data: { deleted: true } });
});

module.exports = { list, getById, getDashboard, create, update, remove };
