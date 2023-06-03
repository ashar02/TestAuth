const logger = require('../utils/logger');

const checkRole = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403).json({message: 'Access Denied'});
    }
  };
};

module.exports = {checkRole};
