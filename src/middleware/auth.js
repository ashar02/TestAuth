const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const {env} = require('../config');
const User = require('../models/user');
const RevokedToken = require('../models/revoked-token');
const {
  StatusCodes,
  HttpCodes,
  sendErrorResponse,
} = require('../utils/response');

const jwtAccessOptions = {
  jwtFromRequest: (req) => {
    const authHeader = req.headers.authorization;
    let accessToken;
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      accessToken = authHeader.substring(7);
    } else if (authHeader) {
      accessToken = authHeader;
    }
    if (accessToken) {
      req.accessToken = accessToken;
      return accessToken;
    }
    const error = sendErrorResponse(null, HttpCodes.UNAUTHORIZED,
        StatusCodes.ERROR_ACCESS_TOKEN);
    throw error;
  },
  secretOrKey: env.JWT_ACCESS_SECRET,
  ignoreExpiration: true,
  passReqToCallback: true,
};

// JWT access strategy
const jwtAccessStrategy = new JwtStrategy(jwtAccessOptions,
    async (req, payload, done) => {
      try {
        const user = await User.findById(payload.sub);
        if (!user) {
          const error = sendErrorResponse(null, HttpCodes.UNAUTHORIZED,
              StatusCodes.ERROR_INVALID_USER);
          return done(error, false);
        }
        if (user.role !== payload.role) {
          const error = sendErrorResponse(null, HttpCodes.UNAUTHORIZED,
              StatusCodes.ERROR_INVALID_ROLE);
          return done(error, false);
        }
        const accessToken = req.accessToken;
        const tokenRevoked = await RevokedToken.findOne({accessToken});
        if (tokenRevoked) {
          const error = sendErrorResponse(null, HttpCodes.UNAUTHORIZED,
              StatusCodes.ERROR_REVOKED_ACCESS_TOKEN);
          return done(error, false);
        }
        const now = Date.now() / 1000;
        if (payload.exp < now) {
          const error = sendErrorResponse(null, HttpCodes.UNAUTHORIZED,
              StatusCodes.ERROR_EXPIRED_ACCESS_TOKEN);
          return done(error, false);
        }
        if (payload.iss !== env.JWT_ISSUER) {
          const error = sendErrorResponse(null, HttpCodes.UNAUTHORIZED,
              StatusCodes.ERROR_INVALID_ISSUER);
          return done(error, false);
        }
        if (payload.aud !== env.JWT_AUDIENCE) {
          const error = sendErrorResponse(null, HttpCodes.UNAUTHORIZED,
              StatusCodes.ERROR_INVALID_AUDIENCE);
          return done(error, false);
        }
        return done(null, user);
      } catch (error) {
        const customError = sendErrorResponse(null, HttpCodes.UNAUTHORIZED,
            StatusCodes.ERROR_EXCEPTION, error.message, error.stack);
        return done(customError, false);
      }
    });

const jwtRefreshOptions = {
  jwtFromRequest: (req) => {
    const authHeader = req.headers.authorization;
    let accessToken;
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      accessToken = authHeader.substring(7);
    } else if (authHeader) {
      accessToken = authHeader;
    }
    if (!accessToken) {
      const error = sendErrorResponse(null, HttpCodes.UNAUTHORIZED,
          StatusCodes.ERROR_ACCESS_TOKEN);
      throw error;
    }
    req.accessToken = accessToken;
    const refreshToken = req.body.refreshToken;
    if (refreshToken) {
      req.refreshToken = refreshToken;
      return refreshToken;
    }
    const error = sendErrorResponse(null, HttpCodes.UNAUTHORIZED,
        StatusCodes.ERROR_REFRESH_TOKEN);
    throw error;
  },
  secretOrKey: env.JWT_REFRESH_SECRET,
  ignoreExpiration: true,
  passReqToCallback: true,
};

// JWT refresh strategy
const jwtRefreshStrategy = new JwtStrategy(jwtRefreshOptions,
    async (req, payload, done) => {
      try {
        const user = await User.findById(payload.sub);
        if (!user) {
          const error = sendErrorResponse(null, HttpCodes.UNAUTHORIZED,
              StatusCodes.ERROR_INVALID_USER);
          return done(error, false);
        }
        if (user.role !== payload.role) {
          const error = sendErrorResponse(null, HttpCodes.UNAUTHORIZED,
              StatusCodes.ERROR_INVALID_ROLE);
          return done(error, false);
        }
        const accessToken = req.accessToken;
        const tokenRevoked = await RevokedToken.findOne({accessToken});
        if (tokenRevoked) {
          const error = sendErrorResponse(null, HttpCodes.UNAUTHORIZED,
              StatusCodes.ERROR_REVOKED_ACCESS_TOKEN);
          return done(error, false);
        }
        if (req.refreshToken !== user.refreshToken) {
          const error = sendErrorResponse(null, HttpCodes.UNAUTHORIZED,
              StatusCodes.ERROR_REVOKED_REFRESH_TOKEN);
          return done(error, false);
        }
        if (payload.iss !== env.JWT_ISSUER) {
          const error = sendErrorResponse(null, HttpCodes.UNAUTHORIZED,
              StatusCodes.ERROR_INVALID_ISSUER);
          return done(error, false);
        }
        if (payload.aud !== env.JWT_AUDIENCE) {
          const error = sendErrorResponse(null, HttpCodes.UNAUTHORIZED,
              StatusCodes.ERROR_INVALID_AUDIENCE);
          return done(error, false);
        }
        return done(null, user);
      } catch (error) {
        const customError = sendErrorResponse(null, HttpCodes.UNAUTHORIZED,
            StatusCodes.ERROR_EXCEPTION, error.message, error.stack);
        return done(customError, false);
      }
    });

// Initialize Passport
passport.use('jwt-access', jwtAccessStrategy);
passport.use('jwt-refresh', jwtRefreshStrategy);

// Export Passport for use in other modules
module.exports = passport;
