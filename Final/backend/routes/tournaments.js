const express = require('express');
const router = express.Router();
const {
  getAllTournaments, getTournamentById, createTournament,
  updateTournament, deleteTournament, getTournamentMatches, getTournamentStandings,
} = require('../controllers/tournamentsController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

/**
 * @swagger
 * tags:
 *   name: Tournaments
 *   description: Tournament management
 */

/**
 * @swagger
 * /tournaments:
 *   get:
 *     summary: Get all tournaments
 *     tags: [Tournaments]
 *     responses:
 *       200:
 *         description: List of tournaments
 */
router.get('/', authenticate, getAllTournaments);

/**
 * @swagger
 * /tournaments/{id}:
 *   get:
 *     summary: Get tournament by ID
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Tournament details
 */
router.get('/:id', authenticate, getTournamentById);

/**
 * @swagger
 * /tournaments:
 *   post:
 *     summary: Create a tournament (Administrator only)
 *     tags: [Tournaments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tournament'
 *     responses:
 *       201:
 *         description: Tournament created
 */
router.post('/', authenticate, authorize('Administrator'), createTournament);

/**
 * @swagger
 * /tournaments/{id}:
 *   put:
 *     summary: Update a tournament (Administrator only)
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Tournament updated
 */
router.put('/:id', authenticate, authorize('Administrator'), updateTournament);

/**
 * @swagger
 * /tournaments/{id}:
 *   delete:
 *     summary: Delete a tournament (Administrator only)
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Tournament deleted
 */
router.delete('/:id', authenticate, authorize('Administrator'), deleteTournament);

/**
 * @swagger
 * /tournaments/{id}/matches:
 *   get:
 *     summary: Get all matches in a tournament
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of matches
 */
router.get('/:id/matches', authenticate, getTournamentMatches);

/**
 * @swagger
 * /tournaments/{id}/standings:
 *   get:
 *     summary: Get standings/points table for a tournament
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Points table sorted by points and NRR
 */
router.get('/:id/standings', authenticate, getTournamentStandings);

module.exports = router;