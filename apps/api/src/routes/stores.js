const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const Store = require('../models/Store.model');
const { isDbConnected } = require('../config/db');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roles');

// GET /api/stores - List all active stores
router.get('/', async (req, res) => {
  try {
    if (isDbConnected()) {
      const stores = await Store.find({ active: true });
      if (stores.length > 0) return res.json(stores);
    }
    return res.json(dataStore.getStores());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stores/:slug
router.get('/:slug', async (req, res) => {
  try {
    const store = dataStore.getStore(req.params.slug);
    if (!store) return res.status(404).json({ message: 'Boutique introuvable' });
    res.json(store);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/stores - Create new store (Super Admin)
router.post('/', async (req, res) => {
  try {
    const newStore = dataStore.createStore(req.body);
    if (isDbConnected()) {
      await Store.create(newStore).catch(e => console.warn(e));
    }
    res.status(201).json(newStore);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/stores/:slug
router.put('/:slug', async (req, res) => {
  try {
    const updated = dataStore.updateStore(req.params.slug, req.body);
    if (!updated) return res.status(404).json({ message: 'Boutique introuvable' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
