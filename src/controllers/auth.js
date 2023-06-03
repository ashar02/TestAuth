const jwt = require('jsonwebtoken');
const {env} = require('../config');
const createError = require('http-errors');
const User = require('../models/user');
const RevokedToken = require('../models/revoked-token');
const Joi = require('joi');
const {
  nameSchema,
  emailSchema,
  passwordSchema,
  roleSchema,
} = require('../utils/validate');
const {StatusCodes} = require('../utils/response');

const registerUser = async (req, res, next) => {
  const schema = Joi.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    role: roleSchema,
  });
  const {error} = schema.validate(req.body);
  if (error) {
    error.status = 200;
    error.statusCode = StatusCodes.ERROR_VALIDATION;
    return next(error);
  }
  const {name, email, password, role} = req.body;
  try {
    const user = new User({name, email, password, role});
    await user.save();
    const token = generateToken(user);
    res.status(200).json({statusMessage: 'User registered successfully',
      statusCode: StatusCodes.SUCCESS, user: {token, userId: user._id}});
  } catch (error) {
    if (error.code === 11000) {
      error.message = 'Email already taken';
    }
    error.status = 200;
    error.statusCode = StatusCodes.ERROR_DATABASE;
    return next(error);
  }
};

const loginUser = async (req, res, next) => {
  const schema = Joi.object({
    email: emailSchema,
    password: passwordSchema,
  });
  const {error} = schema.validate(req.body);
  if (error) {
    error.status = 200;
    error.statusCode = StatusCodes.ERROR_VALIDATION;
    return next(error);
  }
  const {email, password} = req.body;
  try {
    const user = await User.findOne({email});
    if (user) {
      const isValid = await user.isValidPassword(password);
      if (!isValid) {
        const error = createError(200);
        error.statusCode = StatusCodes.ERROR_AUTHENTICATION;
        error.message = 'Either email or password is not correct';
        return next(error);
      }
    } else {
      const error = createError(200);
      error.statusCode = StatusCodes.ERROR_AUTHENTICATION;
      error.message = 'Either email or password is not correct';
      return next(error);
    }
    const token = generateToken(user);
    res.status(200).json({statusMessage: 'User signed in successfully',
      statusCode: StatusCodes.SUCCESS, user: {token, userId: user._id}});
  } catch (error) {
    error.status = 200;
    error.statusCode = StatusCodes.ERROR_DATABASE;
    return next(error);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token;
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      token = authHeader.substring(7);
    } else if (authHeader) {
      token = authHeader;
    }
    if (token) {
      await RevokedToken.create({token});
    }
    res.status(200).json({statusMessage: 'User logout successful',
      statusCode: StatusCodes.SUCCESS});
  } catch (error) {
    error.status = 200;
    error.statusCode = StatusCodes.ERROR_DATABASE;
    return next(error);
  }
};

const generateToken = (user) => {
  const payload = {
    sub: user._id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000), // Generation time in UTC
    exp: Math.floor(Date.now() / 1000) + (2 * 60 * 60), // Expiry in 2H (UTC)
    role: user.role,
  };
  return jwt.sign(payload, env.JWT_SECRET);
};

module.exports = {registerUser, loginUser, logoutUser};

// if (req.version === 'v1') {
// } else if (req.version === 'v2') {
// } else {
// }
