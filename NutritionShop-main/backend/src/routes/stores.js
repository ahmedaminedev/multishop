
const express = require('express');
const router = express.Router();
const { getStores, createStore, updateStore, deleteStore } = require('../controllers/store');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .get(getStores)
  .post(protect, admin, createStore);

router.route('/:id')
  .put(protect, admin, updateStore)
  .delete(protect, admin, deleteStore);

module.exports = router;
