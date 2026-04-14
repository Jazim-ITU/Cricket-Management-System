const express = require('express');
const router = express.Router();
const {
  getAllPlayers, getPlayerById, createPlayer,
  updatePlayer, deletePlayer, getPlayerStats,
} = require('../controllers/playersController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', authenticate, getAllPlayers);
router.get('/:id', authenticate, getPlayerById);
router.post('/', authenticate, authorize('Administrator', 'Team Manager'), createPlayer);
router.put('/:id', authenticate, authorize('Administrator', 'Team Manager'), updatePlayer);
router.delete('/:id', authenticate, authorize('Administrator'), deletePlayer);
router.get('/:id/stats', authenticate, getPlayerStats);

module.exports = router;