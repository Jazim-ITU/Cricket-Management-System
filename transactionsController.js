const pool = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');
const log = require('../utils/logger');


const getAllPlayers = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT p.*, t.team_name
      FROM Players p
      LEFT JOIN Teams t ON p.team_id = t.team_id
      ORDER BY p.last_name ASC
    `);
    return sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
};


const getPlayerById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(`
      SELECT p.*, t.team_name
      FROM Players p
      LEFT JOIN Teams t ON p.team_id = t.team_id
      WHERE p.player_id = ?
    `, [id]);

    if (rows.length === 0) return sendError(res, 'Player not found.', 404);
    return sendSuccess(res, rows[0]);
  } catch (err) {
    next(err);
  }
};


const createPlayer = async (req, res, next) => {
  const { first_name, last_name, date_of_birth, role, batting_style, bowling_style, nationality, team_id } = req.body;

  if (!first_name || !last_name || !role) {
    return sendError(res, 'first_name, last_name, and role are required.', 400);
  }

  
  if (req.user.role === 'Team Manager' && req.user.team_id !== team_id) {
    return sendError(res, 'Team Managers can only add players to their own team.', 403);
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO Players (first_name, last_name, role, batting_style, bowling_style, nationality, team_id)
 VALUES (?, ?, ?, ?, ?, ?, ?)`,
[first_name, last_name, role, batting_style || null, bowling_style || null, nationality || null, team_id || null]
    );

    log.info('Player created', { player_id: result.insertId, first_name, last_name });
    return sendSuccess(res, { player_id: result.insertId, ...req.body }, 'Player created successfully.', 201);
  } catch (err) {
    next(err);
  }
};


const updatePlayer = async (req, res, next) => {
  const { id } = req.params;
  const { first_name, last_name, date_of_birth, role, batting_style, bowling_style, nationality, team_id } = req.body;

  try {
    const [existing] = await pool.execute('SELECT * FROM Players WHERE player_id = ?', [id]);
    if (existing.length === 0) return sendError(res, 'Player not found.', 404);

    const player = existing[0];

    
    if (req.user.role === 'Team Manager' && req.user.team_id !== player.team_id) {
      return sendError(res, 'Team Managers can only update players in their own team.', 403);
    }

    await pool.execute(
      `UPDATE Players
 SET first_name = ?, last_name = ?, role = ?,
     batting_style = ?, bowling_style = ?, nationality = ?, team_id = ?
 WHERE player_id = ?`,
[
  first_name || player.first_name,
  last_name || player.last_name,
  role || player.role,
  batting_style || player.batting_style,
  bowling_style || player.bowling_style,
  nationality || player.nationality,
  team_id !== undefined ? team_id : player.team_id,
  id,
]
    );

    log.info('Player updated', { player_id: id });
    return sendSuccess(res, null, 'Player updated successfully.');
  } catch (err) {
    next(err);
  }
};


const deletePlayer = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [existing] = await pool.execute('SELECT player_id FROM Players WHERE player_id = ?', [id]);
    if (existing.length === 0) return sendError(res, 'Player not found.', 404);

    await pool.execute('DELETE FROM Players WHERE player_id = ?', [id]);
    log.info('Player deleted', { player_id: id });
    return sendSuccess(res, null, 'Player deleted successfully.');
  } catch (err) {
    next(err);
  }
};



const getPlayerStats = async (req, res, next) => {
  const { id } = req.params;

  
  if (req.user.role === 'Player' && req.user.player_id !== parseInt(id)) {
    return sendError(res, 'Players can only view their own statistics.', 403);
  }

  try {
    const [rows] = await pool.execute(`
      SELECT ps.*, m.match_date, t1.team_name AS team1, t2.team_name AS team2
      FROM player_statistics ps
      JOIN Matches m ON ps.match_id = m.match_id
      JOIN Teams t1 ON m.team1_id = t1.team_id
      JOIN Teams t2 ON m.team2_id = t2.team_id
      WHERE ps.player_id = ?
      ORDER BY m.match_date DESC
    `, [id]);

    return sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllPlayers, getPlayerById, createPlayer, updatePlayer, deletePlayer, getPlayerStats };