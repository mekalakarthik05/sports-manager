const asyncHandler = require('../utils/asyncHandler');
const teamService = require('../services/teamService');

const list = asyncHandler(async (req, res) => {
  const opts = { ...req.query, admin: req.admin, search: req.query.search };
  const teams = await teamService.list(opts);
  res.json({ success: true, data: teams });
});

const listByEvent = asyncHandler(async (req, res) => {
  const teams = await teamService.listByEvent(req.params.eventId, { search: req.query.search });
  const safe = teams.map((t) => {
    const { admin_id, ...rest } = t;
    return rest;
  });
  res.json({ success: true, data: safe });
});

const getById = asyncHandler(async (req, res) => {
  const team = await teamService.getById(req.params.teamId);
  const { admin_id, ...rest } = team;
  res.json({ success: true, data: rest });
});

const create = asyncHandler(async (req, res) => {
  const team = await teamService.create(req.body, req.admin.id);
  res.status(201).json({ success: true, data: team });
});

const update = asyncHandler(async (req, res) => {
  const team = await teamService.update(req.params.teamId, req.body, req.admin);
  res.json({ success: true, data: team });
});

const remove = asyncHandler(async (req, res) => {
  await teamService.remove(req.params.teamId, req.admin);
  res.json({ success: true, data: { deleted: true } });
});

const addToEvent = asyncHandler(async (req, res) => {
  const { eventId, teamId } = req.params;
  await teamService.addToEvent(eventId, teamId, req.admin);
  res.json({ success: true, data: { added: true } });
});

const removeFromEvent = asyncHandler(async (req, res) => {
  const { eventId, teamId } = req.params;
  await teamService.removeFromEvent(eventId, teamId, req.admin);
  res.json({ success: true, data: { removed: true } });
});

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
