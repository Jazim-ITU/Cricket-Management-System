const express = require('express');
const router = express.Router();
const { sendOffer, getMyOffers, respondToOffer, getSentOffers } = require('../controllers/offersController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Manager sends offer to player
router.post('/send', authenticate, authorize('Team Manager'), sendOffer);

// Manager views offers they sent
router.get('/sent', authenticate, authorize('Team Manager'), getSentOffers);

// Player views their received offers
router.get('/my-offers', authenticate, authorize('Player'), getMyOffers);

// Player accepts or rejects an offer
router.put('/:offer_id/respond', authenticate, authorize('Player'), respondToOffer);

module.exports = router;