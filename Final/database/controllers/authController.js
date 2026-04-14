const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');
const log = require('../utils/logger');

// Register new user — passwords auto-hashed
const register = async (req, res, next) => {
  const { username, password, role, email, team_id, player_id } = req.body;

  const validRoles = ['Administrator', 'Team Manager', 'Player', 'Analyst'];
  if (!validRoles.includes(role)) {
    return sendError(res, `Invalid role. Must be one of: ${validRoles.join(', ')}`, 400);
  }
  if (!username || !password || !email) {
    return sendError(res, 'username, password, and email are required.', 400);
  }
  if (role === 'Team Manager' && !team_id) {
    return sendError(res, 'team_id is required for Team Manager.', 400);
  }
  if (role === 'Player' && !player_id) {
    return sendError(res, 'player_id is required for Player role.', 400);
  }

  try {
    // Enforce one manager per team
    if (role === 'Team Manager' && team_id) {
      const [existing] = await pool.execute(
        "SELECT user_id, username FROM Users WHERE team_id = ? AND role = 'Team Manager'",
        [team_id]
      );
      if (existing.length > 0) {
        return sendError(
          res,
          `This team already has a manager (${existing[0].username}). Each team can only have one manager.`,
          409
        );
      }
    }

    // Auto-hash password — no manual SQL hashing needed
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [result] = await pool.execute(
      'INSERT INTO Users (username, password_hash, role, email, team_id, player_id) VALUES (?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, role, email, team_id || null, player_id || null]
    );

    log.info('User registered', { username, role, team_id: team_id || null });
    return sendSuccess(res, { user_id: result.insertId, username, role }, 'User registered successfully.', 201);
  } catch (err) {
    next(err);
  }
};

// Login
const login = async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return sendError(res, 'username and password are required.', 400);
  }

  try {
    const [rows] = await pool.execute(
      'SELECT user_id, username, password_hash, role, team_id, player_id FROM Users WHERE username = ?',
      [username]
    );
    if (rows.length === 0) return sendError(res, 'Invalid username or password.', 401);

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return sendError(res, 'Invalid username or password.', 401);

    const payload = {
      user_id: user.user_id,
      username: user.username,
      role: user.role,
      team_id: user.team_id || null,
      player_id: user.player_id || null,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });

    log.info('User logged in', { username, role: user.role });
    return sendSuccess(res, {
      token,
      role: user.role,
      username: user.username,
      team_id: user.team_id || null,
      player_id: user.player_id || null,
    }, 'Login successful.');
  } catch (err) {
    next(err);
  }
};

// Get current user profile
const getMe = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT user_id, username, role, email, team_id, player_id FROM Users WHERE user_id = ?',
      [req.user.user_id]
    );
    if (rows.length === 0) return sendError(res, 'User not found.', 404);
    return sendSuccess(res, rows[0]);
  } catch (err) {
    next(err);
  }
};

// Get all managers with their assigned teams (for admin to see which teams are taken)
const getManagers = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT u.user_id, u.username, u.email, u.team_id, t.team_name, t.city
      FROM Users u
      LEFT JOIN teams t ON u.team_id = t.team_id
      WHERE u.role = 'Team Manager'
      ORDER BY u.username ASC
    `);
    return sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, getManagers };