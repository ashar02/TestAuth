const User = require('../models/user');
const {
  StatusCodes,
  HttpCodes,
  sendErrorResponse,
} = require('../utils/response');

const getUserById = async (req, res, next) => {
  const {userId} = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }
    res.json(user);
  } catch (err) {
    next(err);
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
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

module.exports = {getUserById, updateUser, deleteUser, getAllUsers};
