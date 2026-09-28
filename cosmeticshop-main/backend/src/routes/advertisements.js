
const express = require('express');
const router = express.Router();
const { getAdvertisements, updateAdvertisements } = require('../controllers/advertisement');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .get(getAdvertisements)
  .post(protect, admin, updateAdvertisements);

module.exports = router;
