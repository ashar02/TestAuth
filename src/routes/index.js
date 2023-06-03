const express = require('express');
const authRoutes = require('./auth');
const userRoutes = require('./user');

// eslint-disable-next-line new-cap
const router = express.Router();

// Versioning middleware
router.use((req, res, next) => {
  const version = req.path.split('/')[1];
  req.version = version;
  next();
});

router.use('/v1/auth', authRoutes);
router.use('/v1/users', userRoutes);

module.exports = router;
