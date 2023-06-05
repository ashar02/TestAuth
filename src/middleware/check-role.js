const logger = require('../utils/logger');
const {
  StatusCodes,
  HttpCodes,
  sendErrorResponse,
} = require('../utils/response');

const checkRole = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      return sendErrorResponse(next, HttpCodes.FORBIDDEN,
          StatusCodes.ERROR_FORBIDDEN_ROLE);
    }
  };
};

module.exports = {checkRole};
