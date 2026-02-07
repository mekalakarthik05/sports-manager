const express = require('express');
const teamController = require('../controllers/teamController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, teamController.list);
router.get('/event/:eventId', teamController.listByEvent);
router.get('/:teamId', teamController.getById);
router.post('/', authMiddleware, teamController.create);
router.patch('/:teamId', authMiddleware, teamController.update);
router.delete('/:teamId', authMiddleware, teamController.remove);
router.post('/event/:eventId/team/:teamId', authMiddleware, teamController.addToEvent);
router.delete('/event/:eventId/team/:teamId', authMiddleware, teamController.removeFromEvent);

module.exports = router;
