const express = require('express');
const matchController = require('../controllers/matchController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/sport/:sportId', matchController.listBySport);
router.get('/sport/:sportId/playoffs', matchController.getPlayoffs);
router.get('/:matchId', matchController.getById);
router.post('/', authMiddleware, matchController.create);
router.patch('/:matchId', authMiddleware, matchController.update);
router.delete('/:matchId', authMiddleware, matchController.remove);

module.exports = router;
