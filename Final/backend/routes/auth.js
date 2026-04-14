const express = require('express');
const router = express.Router();
const { register, login, getMe, getManagers } = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and registration
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user (Administrator only)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, email, role]
 *             properties:
 *               username: { type: string }
 *               password: { type: string, format: password }
 *               email: { type: string, format: email }
 *               role:
 *                 type: string
 *                 enum: [Administrator, Team Manager, Player, Analyst]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Access denied
 */
router.post('/register', authenticate, authorize('Administrator'), register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in and receive a JWT token
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string }
 *               password: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Login successful, returns JWT
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get currently authenticated user profile
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, getMe);
router.get('/managers', authenticate, authorize('Administrator'), getManagers);
module.exports = router;