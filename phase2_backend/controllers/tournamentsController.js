const pool = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');
const log = require('../utils/logger');

const getAllTournaments = async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM Tournaments ORDER BY start_date DESC');
    return sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
};

const getTournamentById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute('SELECT * FROM Tournaments WHERE tournament_id = ?', [id]);
    if (rows.length === 0) return sendError(res, 'Tournament not found.', 404);
    return sendSuccess(res, rows[0]);
  } catch (err) {
    next(err);
  }
};

const createTournament = async (req, res, next) => {
  const { tournament_name, start_date, end_date, format } = req.body;
  if (!tournament_name || !format) return sendError(res, 'tournament_name and format are required.', 400);

  try {
    const [result] = await pool.execute(
      'INSERT INTO Tournaments (tournament_name, start_date, end_date, format) VALUES (?, ?, ?, ?)',
      [tournament_name, start_date || null, end_date || null, format]
    );
    log.info('Tournament created', { tournament_id: result.insertId });
    return sendSuccess(res, { tournament_id: result.insertId, ...req.body }, 'Tournament created.', 201);
  } catch (err) {
    next(err);
  }
};

const updateTournament = async (req, res, next) => {
  const { id } = req.params;
  const { tournament_name, start_date, end_date, format } = req.body;

  try {
    const [existing] = await pool.execute('SELECT * FROM Tournaments WHERE tournament_id = ?', [id]);
    if (existing.length === 0) return sendError(res, 'Tournament not found.', 404);

    const t = existing[0];
    await pool.execute(
      'UPDATE Tournaments SET tournament_name=?, start_date=?, end_date=?, format=? WHERE tournament_id=?',
      [tournament_name || t.tournament_name, start_date || t.start_date, end_date || t.end_date, format || t.format, id]
    );
    log.info('Tournament updated', { tournament_id: id });
    return sendSuccess(res, null, 'Tournament updated.');
  } catch (err) {
    next(err);
  }
};

const deleteTournament = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [existing] = await pool.execute('SELECT tournament_id FROM Tournaments WHERE tournament_id = ?', [id]);
    if (existing.length === 0) return sendError(res, 'Tournament not found.', 404);

    await pool.execute('DELETE FROM Tournaments WHERE tournament_id = ?', [id]);
    log.info('Tournament deleted', { tournament_id: id });
    return sendSuccess(res, null, 'Tournament deleted.');
  } catch (err) {
    next(err);
  }
};

const getTournamentMatches = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(`
      SELECT m.*, t1.team_name AS team1_name, t2.team_name AS team2_name, v.venue_name
      FROM Matches m
      JOIN Teams t1 ON m.team1_id = t1.team_id
      JOIN Teams t2 ON m.team2_id = t2.team_id
      JOIN Venues v ON m.venue_id = v.venue_id
      WHERE m.tournament_id = ?
      ORDER BY m.match_date ASC
    `, [id]);
    return sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
};

const getTournamentStandings = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(`
      SELECT ts.*, t.team_name, t.city
      FROM Team_Stats ts
      JOIN Teams t ON ts.team_id = t.team_id
      WHERE ts.tournament_id = ?
      ORDER BY ts.points DESC, ts.net_run_rate DESC
    `, [id]);
    return sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllTournaments, getTournamentById, createTournament, updateTournament,
  deleteTournament, getTournamentMatches, getTournamentStandings,
};