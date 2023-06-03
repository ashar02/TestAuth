const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const {env} = require('../config');
const User = require('../models/user');
const {StatusCodes} = require('../utils/response');

const jwtOptions = {
  jwtFromRequest: (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      const token = authHeader.substring(7);
      return token;
    } else if (authHeader) {
      return authHeader;
    }
    const customResponse = {
      status: 200,
      message: 'Token not found',
      statusCode: StatusCodes.ERROR_VALIDATION,
    };
    throw customResponse;
  },
  secretOrKey: env.JWT_SECRET,
};

// JWT strategy
const jwtStrategy = new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findById(payload.sub);
    if (!user) {
      return done(null, false, {message: 'Invalid user'});
    }
    if (user.role !== payload.role) {
      return done(null, false, {message: 'Role does not match'});
    }
    const tokenRevoked = await RevokedToken.findOne({token: payload.token});
    if (tokenRevoked) {
      return done(null, false, {message: 'Token revoked'});
    }
    const now = Date.now() / 1000;
    if (payload.exp < now) {
      return done(null, false, {message: 'Token expired'});
    }
    return done(null, user);
  } catch (error) {
    return done(error, false, {message: 'User not found'});
  }
});

// Initialize Passport
passport.use(jwtStrategy);

// Export Passport for use in other modules
module.exports = passport;
