// const cluster = require('cluster');
// const numCPUs = require('os').cpus().length;

// if (cluster.isMaster) {
//  for (let i = 0; i < numCPUs; i++) {
//    cluster.fork();
//  }
//  cluster.on('exit', (worker, code, signal) => {
//    console.log(`Worker ${worker.process.pid} died`);
//    // Restart the worker if it crashes
//    cluster.fork();
//  });
// } else {
const https = require('https');
const http = require('http');
const fs = require('fs');
const compression = require('compression');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const logger = require('./utils/logger');
const {
  StatusCodes,
  HttpCodes,
  sendErrorResponse,
} = require('./utils/response');
const {errorHandler} = require('./middleware/error-handler');
const {env} = require('./config');
const routes = require('./routes');
const path = require('path');
const passport = require('./middleware/auth');
// const generateJwtSecret = require('./utils/secret');
// console.log(generateJwtSecret());

const httpsApp = express();

// Middleware
httpsApp.use(compression()); // Enable global compression middleware
httpsApp.use(express.json());
httpsApp.use(express.urlencoded({extended: true}));
// const allowedOrigins = ['https://example1.com', 'https://example2.com'];
// const corsOptions = {
//  origin: allowedOrigins,
//  optionsSuccessStatus: 200, // Respond 200 status code for preflight requests
// };
// httpsApp.use(cors(corsOptions));
httpsApp.use(cors());
httpsApp.use(helmet());
const staticOptions = {
  etag: true, // Enable ETag generation for static resources
  maxAge: '1h', // Set cache-control max-age header to 1 hour
  setHeaders: (res, path) => {
    if (path.endsWith('.gz')) {
      res.set('Content-Encoding', 'gzip');
    }
  },
};
httpsApp.use(express.static(path.join(__dirname, 'public'), staticOptions));

// Initialize Passport
httpsApp.use(passport.initialize());

// Enable ETag support
httpsApp.set('etag', 'strong');

// Connect to MongoDB
require('./services/mongo');

// Routes
httpsApp.use('/api', routes);

// Catch 404
httpsApp.use(function(req, res, next) {
  return sendErrorResponse(next, HttpCodes.NOT_FOUND,
      StatusCodes.ERROR_NOT_FOUND);
});

httpsApp.use(errorHandler);

// Server
const httpsServer = https.createServer({
  key: fs.readFileSync(env.SSL_KEY_PATH),
  cert: fs.readFileSync(env.SSL_CERT_PATH),
}, httpsApp);

httpsServer.listen(env.HTTPS_PORT, () => {
  logger.info(`Server started at https://localhost:${env.HTTPS_PORT}`);
});

if (env.HTTPS_PORT !== env.HTTP_PORT) {
  const httpApp = express();
  httpApp.use((req, res, next) => {
    if (req.secure) {
      next();
    } else {
      const host = req.headers.host.split(':')[0];
      const redirectUrl = 'https://' + host + (env.HTTPS_PORT === '443' ? '' : ':' + env.HTTPS_PORT) + req.url;
      res.redirect(HttpCodes.TEMPORARY_REDIRECT, redirectUrl);
    }
  });

  const httpServer = http.createServer(httpApp);
  httpServer.listen(env.HTTP_PORT, () => {
    logger.info(`Server started at http://localhost:${env.HTTP_PORT}`);
  });
}
// }
