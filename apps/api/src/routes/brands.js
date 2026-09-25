const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const Brand = require('../models/Brand.model');
const { isDbConnected } = require('../config/db');

// GET /api/brands
router.get('/', (req, res) => {
  const storeSlug = req.storeSlug || req.query.storeSlug || null;
  res.json(dataStore.getBrands(storeSlug));
});

// POST /api/brands
router.post('/', async (req, res) => {
  try {
    const storeSlug = req.storeSlug || req.body.storeSlug || 'parashop';
    const newBrand = dataStore.createBrand(req.body, storeSlug);
    if (isDbConnected()) {
      await Brand.create(newBrand).catch(e => console.warn(e));
    }
    res.status(201).json(newBrand);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/brands/:id
router.put('/:id', async (req, res) => {
  try {
    const storeSlug = req.storeSlug || req.body.storeSlug || null;
    const updated = dataStore.updateBrand(req.params.id, req.body, storeSlug);
    if (!updated) return res.status(404).json({ message: 'Marque introuvable' });
    if (isDbConnected()) {
      await Brand.findOneAndUpdate(
        { $or: [{ id: Number(req.params.id) }, { _id: req.params.id }] },
        req.body
      ).catch(e => console.warn(e));
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/brands/:id
router.delete('/:id', async (req, res) => {
  try {
    const storeSlug = req.storeSlug || req.query.storeSlug || null;
    const deleted = dataStore.deleteBrand(req.params.id, storeSlug);
    if (!deleted) return res.status(404).json({ message: 'Marque introuvable' });
    if (isDbConnected()) {
      await Brand.findOneAndDelete({
        $or: [{ id: Number(req.params.id) }, { _id: req.params.id }]
      }).catch(e => console.warn(e));
    }
    res.json({ message: 'Marque supprimée avec succès' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
