const express = require('express');
const passport = require('passport');
const {
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
} = require('../controllers/user');
const {checkRole} = require('../middleware/check-role');

// eslint-disable-next-line new-cap
const router = express.Router();

// Get user by ID
router.get('/:userId', passport.authenticate('jwt-access', {session: false}),
    checkRole('SuperAdmin'),
    getUserById);

// Update user by ID
router.put('/:userId', passport.authenticate('jwt-access', {session: false}),
    updateUser);

// Delete user by ID
router.delete('/:userId', passport.authenticate('jwt-access', {session: false}),
    deleteUser);

// Get all users
router.get('/', passport.authenticate('jwt-access', {session: false}),
    getAllUsers);

module.exports = router;
