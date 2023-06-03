const {env} = require('../config');
const logger = require('../utils/logger');

const errorHandler = (error, req, res, next) => {
  logger.error(`${req.method} ${req.url} - ${error.message}`);
  const httpCode = error.status || 500;
  const statusMessage = error.message || 'Internal Server Error';
  const statusCode = error.statusCode;
  const stack = env.NODE_ENV === 'development' ? error.stack : undefined;
  res.status(httpCode).send({statusCode, statusMessage, stack});
};

module.exports = {errorHandler};
