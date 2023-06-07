const User = require('../models/user');
const {
  StatusCodes,
  HttpCodes,
  sendSuccessResponse,
  sendErrorResponse,
} = require('../utils/response');
const Joi = require('joi');
const {
  userIdSchema,
  paginationSchema,
} = require('../utils/validate');

const getUserById = async (req, res, next) => {
  const schema = Joi.object({
    userId: userIdSchema,
  });
  const {error} = schema.validate(req.params);
  if (error) {
    return sendErrorResponse(next, HttpCodes.UNPROCESSABLE,
        StatusCodes.ERROR_VALIDATION, error.message, error.stack);
  }
  const {userId} = req.params;
  try {
    const user = await User.findById(userId)
        .select('-refreshToken -password -__v'); // .lean();
    if (!user) {
      return sendErrorResponse(next, HttpCodes.NOT_FOUND,
          StatusCodes.ERROR_INVALID_USER);
    }
    // user.userId = user._id;
    // delete user._id;
    return sendSuccessResponse(res, HttpCodes.OK, StatusCodes.SUCCESS,
        'user', user);
  } catch (error) {
    return sendErrorResponse(next, HttpCodes.INTERNAL_ERROR,
        StatusCodes.ERROR_EXCEPTION, error.message, error.stack);
  }
};

const updateUser = async (req, res, next) => {
  const {userId} = req.params;
  const {username, email, password} = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }
    if (username) {
      user.username = username;
    }
    if (email) {
      user.email = email;
    }
    if (password) {
      user.password = password;
    }
    await user.save();
    res.json({message: 'User updated successfully'});
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    await User.findByIdAndDelete(userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  const {error} = paginationSchema.validate(req.query);
  if (error) {
    return sendErrorResponse(next, HttpCodes.UNPROCESSABLE,
        StatusCodes.ERROR_VALIDATION, error.message, error.stack);
  }
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);
    const skip = (page - 1) * limit;
    if (skip >= totalUsers) {
      return sendSuccessResponse(res, HttpCodes.OK, StatusCodes.SUCCESS,
          'data', {
            users: [],
            totalPages,
            currentPage: page,
            totalUsers,
          });
    }
    const users = await User.find()
        .select('-refreshToken -password -__v')
        .skip(skip)
        .limit(limit);
    return sendSuccessResponse(res, HttpCodes.OK, StatusCodes.SUCCESS,
        'data', {
          users,
          totalPages,
          currentPage: page,
          totalUsers,
        });
  } catch (error) {
    return sendErrorResponse(next, HttpCodes.INTERNAL_ERROR,
        StatusCodes.ERROR_EXCEPTION, error.message, error.stack);
  }
};


module.exports = {getUserById, updateUser, deleteUser, getAllUsers};
