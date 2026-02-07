const express = require('express');
const adminController = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public auth endpoints
router.post('/login', adminController.login);
router.post('/register', adminController.register);

// Protected admin management endpoints
router.post('/create', authMiddleware, adminController.createAdmin);
router.get('/events', authMiddleware, adminController.listMyEvents);

module.exports = router;
