const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const {env} = require('../config');
const User = require('../models/user');
const RevokedToken = require('../models/revoked-token');
const {StatusCodes} = require('../utils/response');
const createError = require('http-errors');

const jwtOptions = {
  jwtFromRequest: (req) => {
    const authHeader = req.headers.authorization;
    let token;
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      token = authHeader.substring(7);
    } else if (authHeader) {
      token = authHeader;
    }
    if (token) {
      req.jwtToken = token;
      return token;
    }
    const customResponse = {
      status: 200,
      message: 'Token not found',
      statusCode: StatusCodes.ERROR_VALIDATION,
    };
    throw customResponse;
  },
  secretOrKey: env.JWT_SECRET,
  ignoreExpiration: true,
  passReqToCallback: true,
};

// JWT strategy
const jwtStrategy = new JwtStrategy(jwtOptions, async (req, payload, done) => {
  try {
    const user = await User.findById(payload.sub);
    if (!user) {
      const error = createError(401);
      error.message = 'Invalid user';
      error.statusCode = StatusCodes.ERROR_INVALID_TOKEN;
      return done(error, false);
    }
    if (user.role !== payload.role) {
      const error = createError(401);
      error.message = 'Role not matched';
      error.statusCode = StatusCodes.ERROR_AUTHORIZATION;
      return done(error, false);
    }
    const token = req.jwtToken;
    const tokenRevoked = await RevokedToken.findOne({token});
    if (tokenRevoked) {
      const error = createError(401);
      error.message = 'Token revoked';
      error.statusCode = StatusCodes.ERROR_REVOKED_TOKEN;
      return done(error, false);
    }
    const now = Date.now() / 1000;
    if (payload.exp < now) {
      const error = createError(401);
      error.message = 'Token expired';
      error.statusCode = StatusCodes.ERROR_EXPIRED_TOKEN;
      return done(error, false);
    }
    return done(null, user);
  } catch (error) {
    error.code = 401;
    error.message = 'Token exception';
    error.statusCode = StatusCodes.ERROR_DATABASE;
    return done(error, false);
  }
});

// Initialize Passport
passport.use(jwtStrategy);

// Export Passport for use in other modules
module.exports = passport;
