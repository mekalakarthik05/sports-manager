const asyncHandler = require('../utils/asyncHandler');
const sportService = require('../services/sportService');

const listByEvent = asyncHandler(async (req, res) => {
  const sports = await sportService.listByEvent(req.params.eventId, req.query);
  res.json({ success: true, data: sports });
});

const getById = asyncHandler(async (req, res) => {
  const sport = await sportService.getById(req.params.sportId);
  res.json({ success: true, data: sport });
});

const create = asyncHandler(async (req, res) => {
  const sport = await sportService.create(req.body, req.admin.id);
  res.status(201).json({ success: true, data: sport });
});

const update = asyncHandler(async (req, res) => {
  const sport = await sportService.update(req.params.sportId, req.body, req.admin);
  res.json({ success: true, data: sport });
});

const remove = asyncHandler(async (req, res) => {
  await sportService.remove(req.params.sportId, req.admin);
  res.json({ success: true, data: { deleted: true } });
});

const generatePlayoffs = asyncHandler(async (req, res) => {
  const matches = await sportService.generatePlayoffs(req.params.sportId, req.admin);
  res.status(201).json({ success: true, data: matches });
});

const getTeams = asyncHandler(async (req, res) => {
  const teams = await sportService.listTeams(req.params.sportId);
  res.json({ success: true, data: teams });
});

module.exports = {
  listByEvent,
  getById,
  create,
  update,
  remove,
  generatePlayoffs,
  getTeams,
};
