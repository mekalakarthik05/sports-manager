const asyncHandler = require('../utils/asyncHandler');
const pointsService = require('../services/pointsService');
const { validateUUID } = require('../middleware/validate');

const getSportPoints = asyncHandler(async (req, res) => {
  validateUUID(req.params.sportId, 'sportId');
  const table = await pointsService.getSportPointsTable(req.params.sportId);
  res.json({ success: true, data: table });
});

const updateSportPointsRow = asyncHandler(async (req, res) => {
  const { sportId, teamId } = req.params;
  validateUUID(sportId, 'sportId');
  validateUUID(teamId, 'teamId');
  const row = await pointsService.updateSportPointsRow(sportId, teamId, req.body, req.admin);
  res.json({ success: true, data: row });
});

const getEventPoints = asyncHandler(async (req, res) => {
  validateUUID(req.params.eventId, 'eventId');
  const table = await pointsService.getEventPointsTable(req.params.eventId);
  res.json({ success: true, data: table });
});

module.exports = {
  getSportPoints,
  updateSportPointsRow,
  getEventPoints,
};
