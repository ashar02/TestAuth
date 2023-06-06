const jwt = require('jsonwebtoken');
const {env} = require('../config');
const User = require('../models/user');
const RevokedToken = require('../models/revoked-token');
const Joi = require('joi');
const {
  nameSchema,
  emailSchema,
  passwordSchema,
  roleSchema,
} = require('../utils/validate');
const {
  StatusCodes,
  HttpCodes,
  sendSuccessResponse,
  sendErrorResponse,
} = require('../utils/response');

const registerUser = async (req, res, next) => {
  const schema = Joi.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    role: roleSchema,
  });
  const {error} = schema.validate(req.body);
  if (error) {
    return sendErrorResponse(next, HttpCodes.UNPROCESSABLE,
        StatusCodes.ERROR_VALIDATION, error.message, error.stack);
  }
  const {name, email, password, role} = req.body;
  try {
    const user = new User({name, email, password, role});
    await user.save();
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();
    const body = {accessToken, refreshToken, userId: user._id};
    return sendSuccessResponse(res, HttpCodes.OK, StatusCodes.SUCCESS,
        'user', body);
  } catch (error) {
    if (error.code === 11000) {
      return sendErrorResponse(next, HttpCodes.CONFLICT,
          StatusCodes.ERROR_ALREADY_TAKEN, null, error.stack);
    }
    return sendErrorResponse(next, HttpCodes.INTERNAL_ERROR,
        StatusCodes.ERROR_EXCEPTION, error.message, error.stack);
  }
};

const loginUser = async (req, res, next) => {
  const schema = Joi.object({
    email: emailSchema,
    password: passwordSchema,
  });
  const {error} = schema.validate(req.body);
  if (error) {
    return sendErrorResponse(next, HttpCodes.UNPROCESSABLE,
        StatusCodes.ERROR_VALIDATION, error.message, error.stack);
  }
  const {email, password} = req.body;
  try {
    const user = await User.findOne({email});
    if (user) {
      const isValid = await user.isValidPassword(password);
      if (!isValid) {
        return sendErrorResponse(next, HttpCodes.UNAUTHORIZED,
            StatusCodes.ERROR_EMAIL_PASSWORD);
      }
    } else {
      return sendErrorResponse(next, HttpCodes.UNAUTHORIZED,
          StatusCodes.ERROR_EMAIL_PASSWORD);
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();
    const body = {accessToken, refreshToken, userId: user._id};
    return sendSuccessResponse(res, HttpCodes.OK, StatusCodes.SUCCESS,
        'user', body);
  } catch (error) {
    return sendErrorResponse(next, HttpCodes.INTERNAL_ERROR,
        StatusCodes.ERROR_EXCEPTION, error.message, error.stack);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const user = req.user;
    const accessToken = generateAccessToken(user);
    const body = {accessToken, userId: user._id};
    return sendSuccessResponse(res, HttpCodes.OK, StatusCodes.SUCCESS,
        'user', body);
  } catch (error) {
    return sendErrorResponse(next, HttpCodes.INTERNAL_ERROR,
        StatusCodes.ERROR_EXCEPTION, error.message, error.stack);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    const accessToken = req.accessToken;
    await RevokedToken.create({accessToken});
    await User.findOneAndUpdate({_id: req.user.id}, {refreshToken: null});
    return sendSuccessResponse(res, HttpCodes.OK, StatusCodes.SUCCESS);
  } catch (error) {
    return sendErrorResponse(next, HttpCodes.INTERNAL_ERROR,
        StatusCodes.ERROR_EXCEPTION, error.message, error.stack);
  }
};

const generateAccessToken = (user) => {
  const payload = {
    sub: user._id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000), // Generation time in UTC
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // Expiry 60 minutes (UTC)
    iss: env.JWT_ISSUER,
    aud: env.JWT_AUDIENCE,
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET);
};

const generateRefreshToken = (user) => {
  const payload = {
    sub: user._id,
    email: user.email,
    role: user.role,
    iss: env.JWT_ISSUER,
    aud: env.JWT_AUDIENCE,
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET);
};

module.exports = {registerUser, loginUser, refreshToken, logoutUser};

// if (req.version === 'v1') {
// } else if (req.version === 'v2') {
// } else {
// }
