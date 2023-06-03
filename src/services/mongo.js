const mongoose = require('mongoose');
const {env} = require('../config');
const logger = require('../utils/logger');

let retryCount = 0;
const WAIT_TIME = 10000;

const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  waitQueueTimeoutMS: WAIT_TIME, // max time connection request wait in queue
};

const connectWithRetry = () => {
  mongoose.connect(env.DB_URI, mongoOptions)
      .then(() => {
        logger.info('MongoDB connection established');
      })
      .catch((err) => {
        logger.error('MongoDB connection error:', err);
        logger.info(`Retrying connection in ${WAIT_TIME / 10000} seconds...`);
        setTimeout(connectWithRetry, WAIT_TIME); // Retry connection after x sec
      });
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB connection lost');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

mongoose.connection.on('connecting', () => {
  retryCount++;
  logger.info(`MongoDB connection retry attempt: ${retryCount}`);
});

mongoose.connection.on('error', (error) => {
  logger.info(`MongoDB error ${error}`);
});

connectWithRetry();

module.exports = mongoose.connection;
