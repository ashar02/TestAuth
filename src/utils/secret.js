const crypto = require('crypto');
const logger = require('./logger');

const generateJwtSecret = () => {
  const secret = crypto.randomBytes(32).toString('hex');
  logger.info(secret);
  return secret;
};

module.exports = generateJwtSecret;
