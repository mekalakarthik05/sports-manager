const asyncHandler = require('../utils/asyncHandler');
const adminService = require('../services/adminService');
const eventService = require('../services/eventService');
const eventModel = require('../models/event');

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const result = await adminService.login(username, password);
  res.json({ success: true, data: result });
});

// Public registration endpoint for creating a new admin account.
// Validation and uniqueness rules are enforced in adminService.createAdmin.
const register = asyncHandler(async (req, res) => {
  const { name, username, password } = req.body;
  const admin = await adminService.createAdmin(username, password, name);
  res.status(201).json({ success: true, data: admin });
});

const createAdmin = asyncHandler(async (req, res) => {
  const { name, username, password } = req.body;
  const admin = await adminService.createAdmin(username, password, name);
  res.status(201).json({ success: true, data: admin });
});

const listMyEvents = asyncHandler(async (req, res) => {
  const events = await eventService.listByAdmin(req.admin, { search: req.query.search });
  const withCounts = await Promise.all(
    events.map(async (e) => {
      const sportsCount = await eventModel.getSportsCount(e.id);
      return { ...e, sports_count: sportsCount };
    })
  );
  res.json({ success: true, data: withCounts });
});

module.exports = { login, register, createAdmin, listMyEvents };
