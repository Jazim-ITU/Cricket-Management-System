const express = require('express');
const router = express.Router();
const {
  getAllCoaches, getCoachById, createCoach, updateCoach, deleteCoach,
} = require('../controllers/coachesController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

/**
 * @swagger
 * tags:
 *   name: Coaches
 *   description: Coach management
 */

/**
 * @swagger
 * /coaches:
 *   get:
 *     summary: Get all coaches
 *     tags: [Coaches]
 *     responses:
 *       200:
 *         description: List of all coaches
 */
router.get('/', authenticate, getAllCoaches);

/**
 * @swagger
 * /coaches/{id}:
 *   get:
 *     summary: Get coach by ID
 *     tags: [Coaches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Coach details
 *       404:
 *         description: Coach not found
 */
router.get('/:id', authenticate, getCoachById);

/**
 * @swagger
 * /coaches:
 *   post:
 *     summary: Create a new coach (Administrator or Team Manager)
 *     tags: [Coaches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Coach'
 *     responses:
 *       201:
 *         description: Coach created
 */
router.post('/', authenticate, authorize('Administrator', 'Team Manager'), createCoach);

/**
 * @swagger
 * /coaches/{id}:
 *   put:
 *     summary: Update a coach (Administrator or Team Manager)
 *     tags: [Coaches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Coach updated
 */
router.put('/:id', authenticate, authorize('Administrator', 'Team Manager'), updateCoach);

/**
 * @swagger
 * /coaches/{id}:
 *   delete:
 *     summary: Delete a coach (Administrator only)
 *     tags: [Coaches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Coach deleted
 */
router.delete('/:id', authenticate, authorize('Administrator'), deleteCoach);

module.exports = router;