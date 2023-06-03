const winston = require('winston');
const chalk = require('chalk');

// Define your custom logger
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      format: winston.format.combine(
          winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
          winston.format.printf((info) => {
            const {timestamp, level, message, ...meta} = info;
            switch (level) {
              case 'info':
                return `${chalk.gray(`[${timestamp}]`)} ${level}: ` +
                `${chalk.green(message)} ` +
                `${chalk.green(JSON.stringify(meta))}`;
              case 'warn':
                return `${chalk.gray(`[${timestamp}]`)} ${level}: ` +
                `${chalk.yellow(message)} ` +
                `${chalk.yellow(JSON.stringify(meta))}`;
              case 'error':
                return `${chalk.gray(`[${timestamp}]`)} ` +
                `${level}: ${chalk.red(message)} ` +
                `${chalk.red(JSON.stringify(meta))}`;
              default:
                return `${chalk.gray(`[${timestamp}]`)} ` +
                `${level}: ${chalk.gray(message)} ` +
                `${chalk.gray(JSON.stringify(meta))}`;
            }
          }),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/logs.txt',
      level: 'error',
    }),
  ],
});

module.exports = logger;
