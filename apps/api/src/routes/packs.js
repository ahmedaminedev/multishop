const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const Pack = require('../models/Pack.model');
const { isDbConnected } = require('../config/db');

// GET /api/packs
router.get('/', (req, res) => {
  const storeSlug = req.storeSlug || req.query.storeSlug || null;
  const packs = dataStore.getPacks(storeSlug);
  res.json(packs);
});

// GET /api/packs/:id
router.get('/:id', (req, res) => {
  const storeSlug = req.storeSlug || req.query.storeSlug || null;
  const pack = dataStore.getPackById(req.params.id, storeSlug);
  if (!pack) return res.status(404).json({ message: 'Pack introuvable' });
  res.json(pack);
});

// POST /api/packs
router.post('/', async (req, res) => {
  try {
    const storeSlug = req.storeSlug || req.body.storeSlug || 'parashop';
    const newPack = dataStore.createPack(req.body, storeSlug);
    if (isDbConnected()) {
      await Pack.create(newPack).catch(e => console.warn(e));
    }
    res.status(201).json(newPack);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/packs/:id
router.put('/:id', async (req, res) => {
  try {
    const storeSlug = req.storeSlug || req.body.storeSlug || null;
    const updated = dataStore.updatePack(req.params.id, req.body, storeSlug);
    if (!updated) return res.status(404).json({ message: 'Pack introuvable' });
    if (isDbConnected()) {
      await Pack.findOneAndUpdate(
        { $or: [{ id: Number(req.params.id) }, { _id: req.params.id }] },
        req.body
      ).catch(e => console.warn(e));
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/packs/:id
router.delete('/:id', async (req, res) => {
  try {
    const storeSlug = req.storeSlug || req.query.storeSlug || null;
    const deleted = dataStore.deletePack(req.params.id, storeSlug);
    if (!deleted) return res.status(404).json({ message: 'Pack introuvable' });
    if (isDbConnected()) {
      await Pack.findOneAndDelete({
        $or: [{ id: Number(req.params.id) }, { _id: req.params.id }]
      }).catch(e => console.warn(e));
    }
    res.json({ message: 'Pack supprimé avec succès' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
