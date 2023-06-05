const passport = require('passport');
const express = require('express');
const {
  loginUser,
  registerUser,
  refreshToken,
  logoutUser,
} = require('../controllers/auth');

// eslint-disable-next-line new-cap
const router = express.Router();

// Register
router.post('/register',
    registerUser);

// Login
router.post('/login',
    loginUser);

// Refresh Token
router.post('/refresh-token',
    passport.authenticate('jwt-refresh', {session: false}),
    refreshToken);

// Protected route
router.post('/logout',
    passport.authenticate('jwt-access', {session: false}),
    logoutUser);

module.exports = router;
