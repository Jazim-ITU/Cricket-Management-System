const pool = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');


const getTopBatsmen = async (req, res, next) => {
  const limit = Number(parseInt(req.query.limit) || 10);
  try {
    const [rows] = await pool.execute(`
      SELECT
        p.player_id,
        CONCAT(p.first_name, ' ', p.last_name) AS player_name,
        p.nationality,
        t.team_name,
        SUM(ps.runs_scored) AS total_runs,
        AVG(ps.strike_rate) AS avg_strike_rate,
        COUNT(ps.match_id) AS matches_played
      FROM player_statistics ps
      JOIN players p ON ps.player_id = p.player_id
      LEFT JOIN teams t ON p.team_id = t.team_id
      GROUP BY p.player_id, p.first_name, p.last_name, p.nationality, t.team_name
      ORDER BY total_runs DESC
      LIMIT ${limit}
    `);
    return sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
};


const getTopBowlers = async (req, res, next) => {
  const limit = Number(parseInt(req.query.limit) || 10);
  try {
    const [rows] = await pool.execute(`
      SELECT
        p.player_id,
        CONCAT(p.first_name, ' ', p.last_name) AS player_name,
        p.nationality,
        t.team_name,
        SUM(ps.wickets_taken) AS total_wickets,
        AVG(ps.economy) AS avg_economy,
        COUNT(ps.match_id) AS matches_played
      FROM player_statistics ps
      JOIN players p ON ps.player_id = p.player_id
      LEFT JOIN teams t ON p.team_id = t.team_id
      GROUP BY p.player_id, p.first_name, p.last_name, p.nationality, t.team_name
      ORDER BY total_wickets DESC
      LIMIT ${limit}
    `);
    return sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
};


const getTeamPerformance = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        t.team_id,
        t.team_name,
        SUM(ts.matches_played) AS total_matches,
        SUM(ts.matches_won) AS total_wins,
        SUM(ts.matches_lost) AS total_losses,
        SUM(ts.points) AS total_points,
        AVG(ts.net_runrate) AS avg_nrr
      FROM team_statistics ts
      JOIN teams t ON ts.team_id = t.team_id
      GROUP BY t.team_id, t.team_name
      ORDER BY total_wins DESC
    `);
    return sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
};


const getMatchStatistics = async (req, res, next) => {
  const { matchId } = req.params;
  try {
    const [rows] = await pool.execute(`
      SELECT
        ps.*,
        CONCAT(p.first_name, ' ', p.last_name) AS player_name,
        p.role,
        t.team_name
      FROM player_statistics ps
      JOIN players p ON ps.player_id = p.player_id
      LEFT JOIN teams t ON p.team_id = t.team_id
      WHERE ps.match_id = ?
    `, [matchId]);
    return sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
};


const recordPlayerStat = async (req, res, next) => {
  const { player_id, match_id, runs_scored, wickets_taken, catches, strike_rate, economy } = req.body;
  if (!player_id || !match_id) return sendError(res, 'player_id and match_id are required.', 400);

  try {
    const [result] = await pool.execute(
      `INSERT INTO player_statistics (player_id, match_id, runs_scored, wickets_taken, catches, strike_rate, economy)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [player_id, match_id, runs_scored || 0, wickets_taken || 0, catches || 0, strike_rate || 0.00, economy || 0.00]
    );
    return sendSuccess(res, { stat_id: result.insertId, ...req.body }, 'Player stat recorded.', 201);
  } catch (err) {
    next(err);
  }
};

module.exports = { getTopBatsmen, getTopBowlers, getTeamPerformance, getMatchStatistics, recordPlayerStat };