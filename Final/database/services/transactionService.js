const pool = require('../config/db');
const log = require('../utils/logger');

/**
 * TRANSACTION 1: Assign a Coach to a Team
 *
 * Steps:
 *  1. Verify coach exists.
 *  2. Verify coach is not already assigned to a team.
 *  3. Update coach.team_id within a transaction.
 *  4. COMMIT on success.
 *  5. ROLLBACK with detailed logging on any failure.
 *
 * @param {number} coachId
 * @param {number} teamId
 * @returns {{ success: boolean, message: string, data?: object }}
 */
const assignCoachToTeam = async (coachId, teamId) => {
  const conn = await pool.getConnection();
  log.transaction('BEGIN', { transaction: 'assignCoachToTeam', coachId, teamId });

  try {
    await conn.beginTransaction();

    
    const [coachRows] = await conn.execute(
      'SELECT coach_id, first_name, last_name, team_id FROM Coaches WHERE coach_id = ?',
      [coachId]
    );

    if (coachRows.length === 0) {
      throw Object.assign(new Error(`Coach with ID ${coachId} does not exist.`), { statusCode: 404 });
    }

    const coach = coachRows[0];

    
    if (coach.team_id !== null) {
      throw Object.assign(
        new Error(`Coach ${coach.first_name} ${coach.last_name} is already assigned to team ID ${coach.team_id}.`),
        { statusCode: 409 }
      );
    }

    
    const [teamRows] = await conn.execute(
      'SELECT team_id, team_name FROM Teams WHERE team_id = ?',
      [teamId]
    );

    if (teamRows.length === 0) {
      throw Object.assign(new Error(`Team with ID ${teamId} does not exist.`), { statusCode: 404 });
    }

    const team = teamRows[0];

    
    await conn.execute(
      'UPDATE Coaches SET team_id = ? WHERE coach_id = ?',
      [teamId, coachId]
    );

    await conn.commit();
    log.transaction('COMMIT', { transaction: 'assignCoachToTeam', coachId, teamId });

    return {
      success: true,
      message: `Coach ${coach.first_name} ${coach.last_name} successfully assigned to ${team.team_name}.`,
      data: { coach_id: coachId, team_id: teamId, team_name: team.team_name },
    };
  } catch (err) {
    await conn.rollback();
    log.transaction('ROLLBACK', {
      transaction: 'assignCoachToTeam',
      coachId,
      teamId,
      reason: err.message,
    });
    throw err;
  } finally {
    conn.release();
  }
};

/**
 * TRANSACTION 2: Transfer a Player to Another Team
 *
 * Steps:
 *  1. Verify the player exists.
 *  2. Verify the target team exists.
 *  3. Check team capacity (max 15 players per team).
 *  4. Update player.team_id within a transaction.
 *  5. COMMIT on success.
 *  6. ROLLBACK with detailed logging on any failure.
 *
 * @param {number} playerId
 * @param {number} newTeamId
 * @returns {{ success: boolean, message: string, data?: object }}
 */
const transferPlayer = async (playerId, newTeamId) => {
  const TEAM_MAX_CAPACITY = 15;
  const conn = await pool.getConnection();
  log.transaction('BEGIN', { transaction: 'transferPlayer', playerId, newTeamId });

  try {
    await conn.beginTransaction();

    
    const [playerRows] = await conn.execute(
      'SELECT player_id, first_name, last_name, team_id FROM Players WHERE player_id = ?',
      [playerId]
    );

    if (playerRows.length === 0) {
      throw Object.assign(new Error(`Player with ID ${playerId} does not exist.`), { statusCode: 404 });
    }

    const player = playerRows[0];

    if (player.team_id === newTeamId) {
      throw Object.assign(
        new Error(`Player is already a member of team ID ${newTeamId}.`),
        { statusCode: 409 }
      );
    }

    
    const [teamRows] = await conn.execute(
      'SELECT team_id, team_name FROM Teams WHERE team_id = ?',
      [newTeamId]
    );

    if (teamRows.length === 0) {
      throw Object.assign(new Error(`Target team with ID ${newTeamId} does not exist.`), { statusCode: 404 });
    }

    const newTeam = teamRows[0];

    
    const [countRows] = await conn.execute(
      'SELECT COUNT(*) AS player_count FROM Players WHERE team_id = ?',
      [newTeamId]
    );

    const currentCount = countRows[0].player_count;

    if (currentCount >= TEAM_MAX_CAPACITY) {
      throw Object.assign(
        new Error(`Team ${newTeam.team_name} has reached the maximum capacity of ${TEAM_MAX_CAPACITY} players.`),
        { statusCode: 422 }
      );
    }

    
    await conn.execute(
      'UPDATE Players SET team_id = ? WHERE player_id = ?',
      [newTeamId, playerId]
    );

    await conn.commit();
    log.transaction('COMMIT', { transaction: 'transferPlayer', playerId, newTeamId });

    return {
      success: true,
      message: `Player ${player.first_name} ${player.last_name} successfully transferred to ${newTeam.team_name}.`,
      data: {
        player_id: playerId,
        previous_team_id: player.team_id,
        new_team_id: newTeamId,
        new_team_name: newTeam.team_name,
      },
    };
  } catch (err) {
    await conn.rollback();
    log.transaction('ROLLBACK', {
      transaction: 'transferPlayer',
      playerId,
      newTeamId,
      reason: err.message,
    });
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = { assignCoachToTeam, transferPlayer };