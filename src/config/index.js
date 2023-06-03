const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  env: {
    NODE_ENV: process.env.NODE_ENV,
    HTTPS_PORT: process.env.HTTPS_PORT,
    HTTP_PORT: process.env.HTTP_PORT,
    DB_URI: process.env.DB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    SSL_KEY_PATH: process.env.SSL_KEY_PATH,
    SSL_CERT_PATH: process.env.SSL_CERT_PATH,
  },
};
