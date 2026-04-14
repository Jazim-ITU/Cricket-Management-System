const pool = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');
const log = require('../utils/logger');


const getAllTeams = async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM Teams ORDER BY team_name ASC');
    return sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
};


const getTeamById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute('SELECT * FROM Teams WHERE team_id = ?', [id]);
    if (rows.length === 0) return sendError(res, 'Team not found.', 404);
    return sendSuccess(res, rows[0]);
  } catch (err) {
    next(err);
  }
};


const createTeam = async (req, res, next) => {
  const { team_name, city, founded_year } = req.body;
  if (!team_name) return sendError(res, 'team_name is required.', 400);

  try {
    const [result] = await pool.execute(
      'INSERT INTO Teams (team_name, city, founded_year) VALUES (?, ?, ?)',
      [team_name, city || null, founded_year || null]
    );
    log.info('Team created', { team_id: result.insertId, team_name });
    return sendSuccess(res, { team_id: result.insertId, team_name, city, founded_year }, 'Team created.', 201);
  } catch (err) {
    next(err);
  }
};


const updateTeam = async (req, res, next) => {
  const { id } = req.params;
  const { team_name, city, founded_year } = req.body;

  try {
    const [existing] = await pool.execute('SELECT * FROM Teams WHERE team_id = ?', [id]);
    if (existing.length === 0) return sendError(res, 'Team not found.', 404);

    const t = existing[0];
    await pool.execute(
      'UPDATE Teams SET team_name = ?, city = ?, founded_year = ? WHERE team_id = ?',
      [team_name || t.team_name, city || t.city, founded_year || t.founded_year, id]
    );
    log.info('Team updated', { team_id: id });
    return sendSuccess(res, null, 'Team updated successfully.');
  } catch (err) {
    next(err);
  }
};


const deleteTeam = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [existing] = await pool.execute('SELECT team_id FROM Teams WHERE team_id = ?', [id]);
    if (existing.length === 0) return sendError(res, 'Team not found.', 404);

    await pool.execute('DELETE FROM Teams WHERE team_id = ?', [id]);
    log.info('Team deleted', { team_id: id });
    return sendSuccess(res, null, 'Team deleted successfully.');
  } catch (err) {
    next(err);
  }
};


const getTeamPlayers = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM Players WHERE team_id = ? ORDER BY last_name ASC',
      [id]
    );
    return sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
};


const getTeamStats = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(`
      SELECT ts.*, t.tournament_name
      FROM team_statistics ts
      JOIN Tournaments t ON ts.tournament_id = t.tournament_id
      WHERE ts.team_id = ?
    `, [id]);
    return sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllTeams, getTeamById, createTeam, updateTeam, deleteTeam, getTeamPlayers, getTeamStats };