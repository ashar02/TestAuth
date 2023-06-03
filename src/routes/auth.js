const passport = require('passport');
const express = require('express');
const {loginUser, registerUser, logoutUser} = require('../controllers/auth');

// eslint-disable-next-line new-cap
const router = express.Router();

// Register
router.post('/register',
    registerUser);

// Login
router.post('/login',
    loginUser);

// Protected route
router.post('/logout', passport.authenticate('jwt', {session: false}),
    logoutUser);

module.exports = router;
