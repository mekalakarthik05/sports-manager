const asyncHandler = require('../utils/asyncHandler');
const matchService = require('../services/matchService');

const listBySport = asyncHandler(async (req, res) => {
  const matches = await matchService.listBySport(req.params.sportId, req.query);
  res.json({ success: true, data: matches });
});

const getById = asyncHandler(async (req, res) => {
  const match = await matchService.getById(req.params.matchId);
  res.json({ success: true, data: match });
});

const create = asyncHandler(async (req, res) => {
  const match = await matchService.create(req.body, req.admin);
  res.status(201).json({ success: true, data: match });
});

const update = asyncHandler(async (req, res) => {
  const match = await matchService.update(req.params.matchId, req.body, req.admin);
  res.json({ success: true, data: match });
});

const remove = asyncHandler(async (req, res) => {
  await matchService.remove(req.params.matchId, req.admin);
  res.json({ success: true, data: { deleted: true } });
});

const getPlayoffs = asyncHandler(async (req, res) => {
  const matches = await matchService.getPlayoffs(req.params.sportId);
  res.json({ success: true, data: matches });
});

module.exports = {
  listBySport,
  getById,
  create,
  update,
  remove,
  getPlayoffs,
};
