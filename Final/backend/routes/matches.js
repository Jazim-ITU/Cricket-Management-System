const express = require('express');
const router = express.Router();
const {
  getAllMatches, getMatchById, createMatch,
  updateMatch, deleteMatch, getMatchUmpires, assignUmpire,
} = require('../controllers/matchesController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

/**
 * @swagger
 * tags:
 *   name: Matches
 *   description: Match scheduling and results
 */

/**
 * @swagger
 * /matches:
 *   get:
 *     summary: Get all matches
 *     tags: [Matches]
 *     responses:
 *       200:
 *         description: List of all matches
 */
router.get('/', authenticate, getAllMatches);

/**
 * @swagger
 * /matches/{id}:
 *   get:
 *     summary: Get match by ID
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Match details
 *       404:
 *         description: Match not found
 */
router.get('/:id', authenticate, getMatchById);

/**
 * @swagger
 * /matches:
 *   post:
 *     summary: Create a new match (Administrator only)
 *     tags: [Matches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Match'
 *     responses:
 *       201:
 *         description: Match created
 */
router.post('/', authenticate, authorize('Administrator'), createMatch);

/**
 * @swagger
 * /matches/{id}:
 *   put:
 *     summary: Update a match (Administrator only)
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Match updated
 */
router.put('/:id', authenticate, authorize('Administrator'), updateMatch);

/**
 * @swagger
 * /matches/{id}:
 *   delete:
 *     summary: Delete a match (Administrator only)
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Match deleted
 */
router.delete('/:id', authenticate, authorize('Administrator'), deleteMatch);

/**
 * @swagger
 * /matches/{id}/umpires:
 *   get:
 *     summary: Get umpires for a match
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of umpires for the match
 */
router.get('/:id/umpires', authenticate, getMatchUmpires);

/**
 * @swagger
 * /matches/{id}/umpires:
 *   post:
 *     summary: Assign an umpire to a match (Administrator only)
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [umpire_id, role]
 *             properties:
 *               umpire_id: { type: integer }
 *               role: { type: string, example: "Main Umpire" }
 *     responses:
 *       201:
 *         description: Umpire assigned
 */
router.post('/:id/umpires', authenticate, authorize('Administrator'), assignUmpire);

module.exports = router;