const express = require('express');
const eventController = require('../controllers/eventController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', eventController.list);
router.get('/:eventId/dashboard', eventController.getDashboard);
router.get('/:eventId', eventController.getById);

router.post('/', authMiddleware, eventController.create);
router.patch('/:eventId', authMiddleware, eventController.update);
router.delete('/:eventId', authMiddleware, eventController.remove);

module.exports = router;
