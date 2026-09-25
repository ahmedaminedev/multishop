
const express = require('express');
const router = express.Router();
const { getPromotions, createPromotion, updatePromotion, deletePromotion } = require('../controllers/promotion');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .get(getPromotions)
  .post(protect, admin, createPromotion);

router.route('/:id')
  .put(protect, admin, updatePromotion)
  .delete(protect, admin, deletePromotion);

module.exports = router;
