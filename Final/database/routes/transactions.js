const express = require('express');
const router = express.Router();
const { handleAssignCoach, handleTransferPlayer } = require('../controllers/transactionsController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: ACID transaction operations for critical data changes
 */

/**
 * @swagger
 * /transactions/assign-coach:
 *   post:
 *     summary: Assign a coach to a team (ACID transaction)
 *     tags: [Transactions]
 *     description: |
 *       Executes an ACID transaction that:
 *       1. Verifies the coach exists.
 *       2. Verifies the coach is not already assigned to a team.
 *       3. Verifies the target team exists.
 *       4. Updates coach.team_id and COMMITs.
 *       5. ROLLBACKs and logs on any failure.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [coach_id, team_id]
 *             properties:
 *               coach_id: { type: integer, example: 1 }
 *               team_id: { type: integer, example: 3 }
 *     responses:
 *       200:
 *         description: Coach successfully assigned
 *       404:
 *         description: Coach or team not found
 *       409:
 *         description: Coach already assigned to a team
 *       403:
 *         description: Access denied
 */
router.post('/assign-coach', authenticate, authorize('Administrator'), handleAssignCoach);

/**
 * @swagger
 * /transactions/transfer-player:
 *   post:
 *     summary: Transfer a player to another team (ACID transaction)
 *     tags: [Transactions]
 *     description: |
 *       Executes an ACID transaction that:
 *       1. Verifies the player exists.
 *       2. Verifies the new team exists.
 *       3. Checks team capacity (max 15 players).
 *       4. Updates player.team_id and COMMITs.
 *       5. ROLLBACKs and logs on any failure.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [player_id, new_team_id]
 *             properties:
 *               player_id: { type: integer, example: 5 }
 *               new_team_id: { type: integer, example: 2 }
 *     responses:
 *       200:
 *         description: Player successfully transferred
 *       404:
 *         description: Player or team not found
 *       409:
 *         description: Player already in the target team
 *       422:
 *         description: Team has reached maximum capacity
 */
router.post('/transfer-player', authenticate, authorize('Administrator', 'Team Manager'), handleTransferPlayer);

module.exports = router;