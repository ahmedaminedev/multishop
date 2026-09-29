
const express = require('express');
const router = express.Router();
const { getBrands, createBrand, updateBrand, deleteBrand } = require('../controllers/brand');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .get(getBrands)
  .post(protect, admin, createBrand);

router.route('/:id')
  .put(protect, admin, updateBrand)
  .delete(protect, admin, deleteBrand);

module.exports = router;
