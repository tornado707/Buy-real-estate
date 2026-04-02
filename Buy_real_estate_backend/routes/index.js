const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const propertyRoutes = require('./property');
const favoriteRoutes = require('./favorite');

// Welcome endpoint
router.get('/', (req, res) => {
  res.send('Welcome to the api');
});

router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/favorites', favoriteRoutes);

module.exports = router;