const express = require('express');
const sportController = require('../controllers/sportController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/event/:eventId', sportController.listByEvent);
router.get('/:sportId/teams', sportController.getTeams);
router.get('/:sportId', sportController.getById);
router.post('/', authMiddleware, sportController.create);
router.patch('/:sportId', authMiddleware, sportController.update);
router.delete('/:sportId', authMiddleware, sportController.remove);
router.post('/:sportId/playoffs/generate', authMiddleware, sportController.generatePlayoffs);

module.exports = router;
