const pool = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');
const log = require('../utils/logger');


const getAllMatches = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT m.*,
        t1.team_name AS team1_name,
        t2.team_name AS team2_name,
        v.venue_name, v.city AS venue_city,
        tr.tournament_name,
        w.team_name AS winner_name
      FROM Matches m
      JOIN Teams t1 ON m.team1_id = t1.team_id
      JOIN Teams t2 ON m.team2_id = t2.team_id
      JOIN Venues v ON m.venue_id = v.venue_id
      JOIN Tournaments tr ON m.tournament_id = tr.tournament_id
      LEFT JOIN Teams w ON m.winner_team_id = w.team_id
      ORDER BY m.match_date DESC
    `);
    return sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
};


const getMatchById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(`
      SELECT m.*,
        t1.team_name AS team1_name,
        t2.team_name AS team2_name,
        v.venue_name, v.city AS venue_city,
        tr.tournament_name,
        w.team_name AS winner_name
      FROM Matches m
      JOIN Teams t1 ON m.team1_id = t1.team_id
      JOIN Teams t2 ON m.team2_id = t2.team_id
      JOIN Venues v ON m.venue_id = v.venue_id
      JOIN Tournaments tr ON m.tournament_id = tr.tournament_id
      LEFT JOIN Teams w ON m.winner_team_id = w.team_id
      WHERE m.match_id = ?
    `, [id]);

    if (rows.length === 0) return sendError(res, 'Match not found.', 404);
    return sendSuccess(res, rows[0]);
  } catch (err) {
    next(err);
  }
};


const createMatch = async (req, res, next) => {
  const { tournament_id, venue_id, team1_id, team2_id, match_date, start_time, end_time, winner_team_id } = req.body;

  if (!tournament_id || !venue_id || !team1_id || !team2_id || !match_date) {
    return sendError(res, 'tournament_id, venue_id, team1_id, team2_id, and match_date are required.', 400);
  }

  if (team1_id === team2_id) {
    return sendError(res, 'team1_id and team2_id cannot be the same team.', 400);
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO Matches (tournament_id, venue_id, team1_id, team2_id, match_date, start_time, end_time, winner_team_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [tournament_id, venue_id, team1_id, team2_id, match_date, start_time || null, end_time || null, winner_team_id || null]
    );
    log.info('Match created', { match_id: result.insertId });
    return sendSuccess(res, { match_id: result.insertId, ...req.body }, 'Match created.', 201);
  } catch (err) {
    next(err);
  }
};


const updateMatch = async (req, res, next) => {
  const { id } = req.params;
  const { tournament_id, venue_id, team1_id, team2_id, match_date, start_time, end_time, winner_team_id } = req.body;

  try {
    const [existing] = await pool.execute('SELECT * FROM Matches WHERE match_id = ?', [id]);
    if (existing.length === 0) return sendError(res, 'Match not found.', 404);

    const m = existing[0];
    await pool.execute(
      `UPDATE Matches SET tournament_id=?, venue_id=?, team1_id=?, team2_id=?,
       match_date=?, start_time=?, end_time=?, winner_team_id=? WHERE match_id=?`,
      [
        tournament_id || m.tournament_id,
        venue_id || m.venue_id,
        team1_id || m.team1_id,
        team2_id || m.team2_id,
        match_date || m.match_date,
        start_time !== undefined ? start_time : m.start_time,
        end_time !== undefined ? end_time : m.end_time,
        winner_team_id !== undefined ? winner_team_id : m.winner_team_id,
        id,
      ]
    );
    log.info('Match updated', { match_id: id });
    return sendSuccess(res, null, 'Match updated successfully.');
  } catch (err) {
    next(err);
  }
};


const deleteMatch = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [existing] = await pool.execute('SELECT match_id FROM Matches WHERE match_id = ?', [id]);
    if (existing.length === 0) return sendError(res, 'Match not found.', 404);

    await pool.execute('DELETE FROM Matches WHERE match_id = ?', [id]);
    log.info('Match deleted', { match_id: id });
    return sendSuccess(res, null, 'Match deleted.');
  } catch (err) {
    next(err);
  }
};


const getMatchUmpires = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(`
      SELECT u.*, mu.role AS umpire_role
      FROM Match_Umpires mu
      JOIN Umpires u ON mu.umpire_id = u.umpire_id
      WHERE mu.match_id = ?
    `, [id]);
    return sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
};


const assignUmpire = async (req, res, next) => {
  const { id } = req.params;
  const { umpire_id, role } = req.body;

  if (!umpire_id || !role) return sendError(res, 'umpire_id and role are required.', 400);

  try {
    await pool.execute(
      'INSERT INTO Match_Umpires (match_id, umpire_id, role) VALUES (?, ?, ?)',
      [id, umpire_id, role]
    );
    log.info('Umpire assigned to match', { match_id: id, umpire_id });
    return sendSuccess(res, null, 'Umpire assigned to match.', 201);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllMatches, getMatchById, createMatch, updateMatch, deleteMatch, getMatchUmpires, assignUmpire };