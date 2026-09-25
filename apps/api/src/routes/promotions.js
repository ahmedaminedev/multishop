const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const Promotion = require('../models/Promotion.model');
const { isDbConnected } = require('../config/db');

// GET /api/promotions
router.get('/', (req, res) => {
  const storeSlug = req.storeSlug || req.query.storeSlug || null;
  res.json(dataStore.getPromotions(storeSlug));
});

// POST /api/promotions
router.post('/', async (req, res) => {
  try {
    const storeSlug = req.storeSlug || req.body.storeSlug || 'parashop';
    const newPromo = dataStore.createPromotion(req.body, storeSlug);
    if (isDbConnected()) {
      await Promotion.create(newPromo).catch(e => console.warn(e));
    }
    res.status(201).json(newPromo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/promotions/:id
router.put('/:id', async (req, res) => {
  try {
    const storeSlug = req.storeSlug || req.body.storeSlug || null;
    const updated = dataStore.updatePromotion(req.params.id, req.body, storeSlug);
    if (!updated) return res.status(404).json({ message: 'Promotion introuvable' });
    if (isDbConnected()) {
      await Promotion.findOneAndUpdate(
        { $or: [{ id: Number(req.params.id) }, { _id: req.params.id }] },
        req.body
      ).catch(e => console.warn(e));
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/promotions/:id
router.delete('/:id', async (req, res) => {
  try {
    const storeSlug = req.storeSlug || req.query.storeSlug || null;
    const deleted = dataStore.deletePromotion(req.params.id, storeSlug);
    if (!deleted) return res.status(404).json({ message: 'Promotion introuvable' });
    if (isDbConnected()) {
      await Promotion.findOneAndDelete({
        $or: [{ id: Number(req.params.id) }, { _id: req.params.id }]
      }).catch(e => console.warn(e));
    }
    res.json({ message: 'Promotion supprimée avec succès' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
