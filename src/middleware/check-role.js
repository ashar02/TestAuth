const logger = require('../utils/logger');
const {StatusCodes} = require('../utils/response');

const checkRole = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403).json({statusMessage: 'Access denied',
        statusCode: StatusCodes.ERROR_AUTHORIZATION});
    }
  };
};

module.exports = {checkRole};
