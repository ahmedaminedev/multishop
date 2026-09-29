
const express = require('express');
const router = express.Router();
const { getOffersConfig, updateOffersConfig } = require('../controllers/offersConfig');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .get(getOffersConfig)
  .post(protect, admin, updateOffersConfig);

module.exports = router;
