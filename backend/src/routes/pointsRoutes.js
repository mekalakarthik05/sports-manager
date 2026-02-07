const express = require('express');
const pointsController = require('../controllers/pointsController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/sport/:sportId', pointsController.getSportPoints);
router.get('/event/:eventId', pointsController.getEventPoints);
router.put('/sport/:sportId/team/:teamId', authMiddleware, pointsController.updateSportPointsRow);

module.exports = router;
