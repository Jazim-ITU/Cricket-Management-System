const express = require('express');
const router = express.Router();
const {
  getTopBatsmen, getTopBowlers, getTeamPerformance,
  getMatchStatistics, recordPlayerStat,
} = require('../controllers/statisticsController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: Performance statistics and analytics
 */

/**
 * @swagger
 * /statistics/top-batsmen:
 *   get:
 *     summary: Get top run scorers
 *     tags: [Statistics]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Number of results to return
 *     responses:
 *       200:
 *         description: Top batsmen by runs
 */
router.get('/top-batsmen', authenticate, getTopBatsmen);

/**
 * @swagger
 * /statistics/top-bowlers:
 *   get:
 *     summary: Get top wicket takers
 *     tags: [Statistics]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Top bowlers by wickets
 */
router.get('/top-bowlers', authenticate, getTopBowlers);

/**
 * @swagger
 * /statistics/team-performance:
 *   get:
 *     summary: Get aggregated performance stats for all teams
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Team win/loss summaries
 */
router.get('/team-performance', authenticate, getTeamPerformance);

/**
 * @swagger
 * /statistics/match/{matchId}:
 *   get:
 *     summary: Get player stats for a specific match
 *     tags: [Statistics]
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Match statistics per player
 */
router.get('/match/:matchId', authenticate, getMatchStatistics);

/**
 * @swagger
 * /statistics:
 *   post:
 *     summary: Record player stats for a match (Administrator only)
 *     tags: [Statistics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [player_id, match_id]
 *             properties:
 *               player_id: { type: integer }
 *               match_id: { type: integer }
 *               runs_scored: { type: integer }
 *               wickets_taken: { type: integer }
 *               catches: { type: integer }
 *               strike_rate: { type: number }
 *               economy: { type: number }
 *     responses:
 *       201:
 *         description: Stat recorded
 */
router.post('/', authenticate, authorize('Administrator'), recordPlayerStat);

module.exports = router;