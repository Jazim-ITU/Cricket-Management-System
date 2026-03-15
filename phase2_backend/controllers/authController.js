const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');
const log = require('../utils/logger');


const register = async (req, res, next) => {
  const { username, password, role, email } = req.body;

  const validRoles = ['Administrator', 'Team Manager', 'Player', 'Analyst'];
  if (!validRoles.includes(role)) {
    return sendError(res, `Invalid role. Must be one of: ${validRoles.join(', ')}`, 400);
  }

  if (!username || !password || !email) {
    return sendError(res, 'username, password, and email are required.', 400);
  }

  try {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [result] = await pool.execute(
      'INSERT INTO Users (username, password_hash, role, email) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, role, email]
    );

    log.info('User registered', { username, role });
    return sendSuccess(res, { user_id: result.insertId, username, role }, 'User registered successfully.', 201);
  } catch (err) {
    next(err);
  }
};


const login = async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return sendError(res, 'username and password are required.', 400);
  }

  try {
    const [rows] = await pool.execute(
      'SELECT user_id, username, password_hash, role FROM Users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return sendError(res, 'Invalid username or password.', 401);
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return sendError(res, 'Invalid username or password.', 401);
    }

    const payload = { user_id: user.user_id, username: user.username, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });

    log.info('User logged in', { username, role: user.role });
    return sendSuccess(res, { token, role: user.role, username: user.username }, 'Login successful.');
  } catch (err) {
    next(err);
  }
};


const getMe = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT user_id, username, role, email FROM Users WHERE user_id = ?',
      [req.user.user_id]
    );

    if (rows.length === 0) {
      return sendError(res, 'User not found.', 404);
    }

    return sendSuccess(res, rows[0]);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };