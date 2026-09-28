
const express = require('express');
const router = express.Router();
const { getPacks, createPack, updatePack, deletePack } = require('../controllers/pack');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .get(getPacks)
  .post(protect, admin, createPack);

router.route('/:id')
  .put(protect, admin, updatePack)
  .delete(protect, admin, deletePack);

module.exports = router;
