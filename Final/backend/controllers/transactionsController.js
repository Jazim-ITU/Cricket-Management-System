const { assignCoachToTeam, transferPlayer } = require('../services/transactionService');
const { sendSuccess, sendError } = require('../utils/response');


const handleAssignCoach = async (req, res, next) => {
  const { coach_id, team_id } = req.body;

  if (!coach_id || !team_id) {
    return sendError(res, 'coach_id and team_id are required.', 400);
  }

  try {
    const result = await assignCoachToTeam(parseInt(coach_id), parseInt(team_id));
    return sendSuccess(res, result.data, result.message);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return sendError(res, err.message, statusCode);
  }
};


const handleTransferPlayer = async (req, res, next) => {
  const { player_id, new_team_id } = req.body;

  if (!player_id || !new_team_id) {
    return sendError(res, 'player_id and new_team_id are required.', 400);
  }

  try {
    const result = await transferPlayer(parseInt(player_id), parseInt(new_team_id));
    return sendSuccess(res, result.data, result.message);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return sendError(res, err.message, statusCode);
  }
};

module.exports = { handleAssignCoach, handleTransferPlayer };