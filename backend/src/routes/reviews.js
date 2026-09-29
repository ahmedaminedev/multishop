
const express = require('express');
const router = express.Router();
const { getReviews, createReview } = require('../controllers/review');
const { protect } = require('../middleware/auth');

router.route('/:targetType/:targetId')
  .get(getReviews);

router.route('/')
  .post(protect, createReview);

module.exports = router;
