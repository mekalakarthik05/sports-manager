const express = require('express');
const adminRoutes = require('./adminRoutes');
const eventRoutes = require('./eventRoutes');
const sportRoutes = require('./sportRoutes');
const matchRoutes = require('./matchRoutes');
const teamRoutes = require('./teamRoutes');
const pointsRoutes = require('./pointsRoutes');

const router = express.Router();

router.use('/admin', adminRoutes);
router.use('/events', eventRoutes);
router.use('/sports', sportRoutes);
router.use('/matches', matchRoutes);
router.use('/teams', teamRoutes);
router.use('/points', pointsRoutes);

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'OK', timestamp: new Date().toISOString() });
});

module.exports = router;
