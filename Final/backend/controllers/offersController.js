const pool = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');
const log = require('../utils/logger');

// Manager sends offer to a player
const sendOffer = async (req, res, next) => {
  const { player_id, message } = req.body;
  const manager = req.user;

  if (!player_id) return sendError(res, 'player_id is required.', 400);
  if (!manager.team_id) return sendError(res, 'You are not assigned to any team.', 403);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Check player exists
    const [playerRows] = await conn.execute(
      'SELECT player_id, first_name, last_name, team_id FROM players WHERE player_id = ?',
      [player_id]
    );
    if (playerRows.length === 0) {
      throw Object.assign(new Error('Player not found.'), { statusCode: 404 });
    }
    const player = playerRows[0];

    // Check player is not already in manager's team
    if (player.team_id === manager.team_id) {
      throw Object.assign(new Error('This player is already in your team.'), { statusCode: 409 });
    }

    // Check manager's team capacity
    const [countRows] = await conn.execute(
      'SELECT COUNT(*) AS player_count FROM players WHERE team_id = ?',
      [manager.team_id]
    );
    const currentCount = countRows[0].player_count;
    const [teamRows] = await conn.execute('SELECT * FROM teams WHERE team_id = ?', [manager.team_id]);
    const team = teamRows[0];

    if (currentCount >= team.max_players) {
      throw Object.assign(
        new Error(`Your team has reached maximum capacity of ${team.max_players} players.`),
        { statusCode: 422 }
      );
    }

    // Check no pending offer already exists for this player from this team
    const [existingOffers] = await conn.execute(
      `SELECT offer_id FROM offers 
       WHERE player_id = ? AND to_team_id = ? AND status = 'pending'`,
      [player_id, manager.team_id]
    );
    if (existingOffers.length > 0) {
      throw Object.assign(
        new Error('A pending offer already exists for this player from your team.'),
        { statusCode: 409 }
      );
    }

    // Insert offer
    const [result] = await conn.execute(
      `INSERT INTO offers (player_id, from_team_id, to_team_id, manager_user_id, message, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [player_id, player.team_id || 0, manager.team_id, manager.user_id, message || null]
    );

    await conn.commit();
    log.info('Offer sent', { offer_id: result.insertId, player_id, to_team_id: manager.team_id });

    return sendSuccess(res, { offer_id: result.insertId }, 'Offer sent successfully.', 201);
  } catch (err) {
    await conn.rollback();
    log.transaction('ROLLBACK', { reason: err.message });
    const statusCode = err.statusCode || 500;
    return sendError(res, err.message, statusCode);
  } finally {
    conn.release();
  }
};

// Player views their offers
const getMyOffers = async (req, res, next) => {
  const { player_id } = req.user;
  if (!player_id) return sendError(res, 'No player profile linked to your account.', 403);

  try {
    const [rows] = await pool.execute(`
      SELECT o.*,
        p.first_name, p.last_name,
        t1.team_name AS from_team_name,
        t2.team_name AS to_team_name
      FROM offers o
      JOIN players p ON o.player_id = p.player_id
      LEFT JOIN teams t1 ON o.from_team_id = t1.team_id
      JOIN teams t2 ON o.to_team_id = t2.team_id
      WHERE o.player_id = ?
      ORDER BY o.created_at DESC
    `, [player_id]);
    return sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
};

// Player responds to offer (accept or reject)
const respondToOffer = async (req, res, next) => {
  const { offer_id } = req.params;
  const { action } = req.body; // 'accept' or 'reject'
  const { player_id } = req.user;

  if (!['accept', 'reject'].includes(action)) {
    return sendError(res, 'action must be accept or reject.', 400);
  }
  if (!player_id) return sendError(res, 'No player profile linked to your account.', 403);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Get offer
    const [offerRows] = await conn.execute(
      'SELECT * FROM offers WHERE offer_id = ? AND status = ?',
      [offer_id, 'pending']
    );
    if (offerRows.length === 0) {
      throw Object.assign(new Error('Offer not found or already responded to.'), { statusCode: 404 });
    }
    const offer = offerRows[0];

    // Verify this offer belongs to this player
    if (offer.player_id !== player_id) {
      throw Object.assign(new Error('This offer is not for you.'), { statusCode: 403 });
    }

    if (action === 'accept') {
      // Check team capacity again
      const [countRows] = await conn.execute(
        'SELECT COUNT(*) AS player_count FROM players WHERE team_id = ?',
        [offer.to_team_id]
      );
      const [teamRows] = await conn.execute('SELECT * FROM teams WHERE team_id = ?', [offer.to_team_id]);
      const team = teamRows[0];

      if (countRows[0].player_count >= team.max_players) {
        throw Object.assign(
          new Error(`Team ${team.team_name} has reached maximum capacity. Cannot accept offer.`),
          { statusCode: 422 }
        );
      }

      // Transfer player to new team
      await conn.execute(
        'UPDATE players SET team_id = ? WHERE player_id = ?',
        [offer.to_team_id, player_id]
      );

      // Update offer status
      await conn.execute(
        "UPDATE offers SET status = 'accepted' WHERE offer_id = ?",
        [offer_id]
      );

      // Reject all other pending offers for this player
      await conn.execute(
        "UPDATE offers SET status = 'rejected' WHERE player_id = ? AND offer_id != ? AND status = 'pending'",
        [player_id, offer_id]
      );

      await conn.commit();
      log.transaction('COMMIT', { action: 'accept_offer', offer_id, player_id, to_team_id: offer.to_team_id });
      return sendSuccess(res, { new_team_id: offer.to_team_id }, 'Offer accepted. You have joined the new team!');
    } else {
      // Reject offer
      await conn.execute(
        "UPDATE offers SET status = 'rejected' WHERE offer_id = ?",
        [offer_id]
      );
      await conn.commit();
      log.transaction('COMMIT', { action: 'reject_offer', offer_id });
      return sendSuccess(res, null, 'Offer rejected.');
    }
  } catch (err) {
    await conn.rollback();
    log.transaction('ROLLBACK', { reason: err.message });
    const statusCode = err.statusCode || 500;
    return sendError(res, err.message, statusCode);
  } finally {
    conn.release();
  }
};

// Manager views offers they sent
const getSentOffers = async (req, res, next) => {
  const manager = req.user;
  if (!manager.team_id) return sendError(res, 'Not assigned to any team.', 403);

  try {
    const [rows] = await pool.execute(`
      SELECT o.*,
        CONCAT(p.first_name, ' ', p.last_name) AS player_name,
        p.role, p.nationality,
        t1.team_name AS from_team_name,
        t2.team_name AS to_team_name
      FROM offers o
      JOIN players p ON o.player_id = p.player_id
      LEFT JOIN teams t1 ON o.from_team_id = t1.team_id
      JOIN teams t2 ON o.to_team_id = t2.team_id
      WHERE o.to_team_id = ?
      ORDER BY o.created_at DESC
    `, [manager.team_id]);
    return sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
};

module.exports = { sendOffer, getMyOffers, respondToOffer, getSentOffers };