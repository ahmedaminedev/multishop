const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');

// GET /api/advertisements
router.get('/', (req, res) => {
  const storeSlug = req.storeSlug || req.query.storeSlug || null;
  const ads = dataStore.getAdvertisements(storeSlug);
  res.json(ads);
});

// PUT /api/advertisements
router.put('/', (req, res) => {
  const storeSlug = req.storeSlug || req.body.storeSlug || null;
  const updated = dataStore.updateAdvertisements(storeSlug, req.body);
  res.json(updated);
});

module.exports = router;
