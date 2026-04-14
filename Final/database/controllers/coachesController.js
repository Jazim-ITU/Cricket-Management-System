const pool = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');
const log = require('../utils/logger');

const getAllCoaches = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT c.*, t.team_name FROM Coaches c
      LEFT JOIN Teams t ON c.team_id = t.team_id
      ORDER BY c.last_name ASC
    `);
    return sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
};

const getCoachById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(`
      SELECT c.*, t.team_name FROM Coaches c
      LEFT JOIN Teams t ON c.team_id = t.team_id
      WHERE c.coach_id = ?
    `, [id]);
    if (rows.length === 0) return sendError(res, 'Coach not found.', 404);
    return sendSuccess(res, rows[0]);
  } catch (err) {
    next(err);
  }
};

const createCoach = async (req, res, next) => {
  const { first_name, last_name, specialization, experience_years, team_id } = req.body;
  if (!first_name || !last_name) return sendError(res, 'first_name and last_name are required.', 400);

  try {
    const [result] = await pool.execute(
      'INSERT INTO Coaches (first_name, last_name, specialization, experience_years, team_id) VALUES (?, ?, ?, ?, ?)',
      [first_name, last_name, specialization || null, experience_years || null, team_id || null]
    );
    log.info('Coach created', { coach_id: result.insertId });
    return sendSuccess(res, { coach_id: result.insertId, ...req.body }, 'Coach created.', 201);
  } catch (err) {
    next(err);
  }
};

const updateCoach = async (req, res, next) => {
  const { id } = req.params;
  const { first_name, last_name, specialization, experience_years, team_id } = req.body;

  try {
    const [existing] = await pool.execute('SELECT * FROM Coaches WHERE coach_id = ?', [id]);
    if (existing.length === 0) return sendError(res, 'Coach not found.', 404);

    const c = existing[0];
    await pool.execute(
      'UPDATE Coaches SET first_name=?, last_name=?, specialization=?, experience_years=?, team_id=? WHERE coach_id=?',
      [
        first_name || c.first_name,
        last_name || c.last_name,
        specialization !== undefined ? specialization : c.specialization,
        experience_years !== undefined ? experience_years : c.experience_years,
        team_id !== undefined ? team_id : c.team_id,
        id,
      ]
    );
    log.info('Coach updated', { coach_id: id });
    return sendSuccess(res, null, 'Coach updated.');
  } catch (err) {
    next(err);
  }
};

const deleteCoach = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [existing] = await pool.execute('SELECT coach_id FROM Coaches WHERE coach_id = ?', [id]);
    if (existing.length === 0) return sendError(res, 'Coach not found.', 404);

    await pool.execute('DELETE FROM Coaches WHERE coach_id = ?', [id]);
    log.info('Coach deleted', { coach_id: id });
    return sendSuccess(res, null, 'Coach deleted.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllCoaches, getCoachById, createCoach, updateCoach, deleteCoach };