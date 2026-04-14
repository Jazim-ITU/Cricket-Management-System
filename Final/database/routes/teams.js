const express = require('express');
const router = express.Router();
const {
  getAllTeams, getTeamById, createTeam,
  updateTeam, deleteTeam, getTeamPlayers, getTeamStats,
} = require('../controllers/teamsController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: Team management
 */

/**
 * @swagger
 * /teams:
 *   get:
 *     summary: Get all teams
 *     tags: [Teams]
 *     responses:
 *       200:
 *         description: List of all teams
 */
router.get('/', authenticate, getAllTeams);

/**
 * @swagger
 * /teams/{id}:
 *   get:
 *     summary: Get team by ID
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Team details
 *       404:
 *         description: Team not found
 */
router.get('/:id', authenticate, getTeamById);

/**
 * @swagger
 * /teams:
 *   post:
 *     summary: Create a new team (Administrator only)
 *     tags: [Teams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Team'
 *     responses:
 *       201:
 *         description: Team created
 */
router.post('/', authenticate, authorize('Administrator'), createTeam);

/**
 * @swagger
 * /teams/{id}:
 *   put:
 *     summary: Update a team (Administrator only)
 *     tags: [Teams]
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
 *             $ref: '#/components/schemas/Team'
 *     responses:
 *       200:
 *         description: Team updated
 */
router.put('/:id', authenticate, authorize('Administrator'), updateTeam);

/**
 * @swagger
 * /teams/{id}:
 *   delete:
 *     summary: Delete a team (Administrator only)
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Team deleted
 */
router.delete('/:id', authenticate, authorize('Administrator'), deleteTeam);

/**
 * @swagger
 * /teams/{id}/players:
 *   get:
 *     summary: Get all players for a team
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of players in the team
 */
router.get('/:id/players', authenticate, getTeamPlayers);

/**
 * @swagger
 * /teams/{id}/stats:
 *   get:
 *     summary: Get tournament statistics for a team
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Team statistics by tournament
 */
router.get('/:id/stats', authenticate, getTeamStats);

module.exports = router;