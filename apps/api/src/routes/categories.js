const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const Category = require('../models/Category.model');
const { isDbConnected } = require('../config/db');

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const storeSlug = req.storeSlug || req.query.storeSlug || req.query.store || null;
    if (isDbConnected()) {
      const query = storeSlug && storeSlug !== 'all' ? { storeSlug } : {};
      const dbCategories = await Category.find(query);
      if (dbCategories && dbCategories.length > 0) {
        return res.json(dbCategories);
      }
    }
    const categories = dataStore.getCategories(storeSlug);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/categories/:nameOrId
router.get('/:nameOrId', async (req, res) => {
  try {
    const storeSlug = req.storeSlug || req.query.storeSlug || null;
    const cat = dataStore.getCategoryByNameOrId(req.params.nameOrId, storeSlug);
    if (!cat) return res.status(404).json({ message: 'Catégorie introuvable' });
    res.json(cat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/categories
router.post('/', async (req, res) => {
  try {
    const storeSlug = req.storeSlug || req.body.storeSlug || 'parashop';
    const catData = {
      name: req.body.name,
      subCategories: req.body.subCategories || [],
      megaMenu: req.body.megaMenu || undefined,
      icon: req.body.icon || '',
      storeSlug
    };
    const newCat = dataStore.createCategory(catData, storeSlug);
    if (isDbConnected()) {
      await Category.create(newCat).catch(e => console.warn(e));
    }
    res.status(201).json(newCat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/categories/:nameOrId
router.put('/:nameOrId', async (req, res) => {
  try {
    const storeSlug = req.storeSlug || req.body.storeSlug || null;
    const updated = dataStore.updateCategory(req.params.nameOrId, req.body, storeSlug);
    if (!updated) return res.status(404).json({ message: 'Catégorie introuvable' });

    if (isDbConnected()) {
      await Category.findOneAndUpdate(
        { $or: [{ name: req.params.nameOrId }, { _id: req.params.nameOrId }] },
        req.body,
        { new: true }
      ).catch(e => console.warn(e));
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/categories/:nameOrId
router.delete('/:nameOrId', async (req, res) => {
  try {
    const storeSlug = req.storeSlug || req.query.storeSlug || null;
    const deleted = dataStore.deleteCategory(req.params.nameOrId, storeSlug);
    if (!deleted) return res.status(404).json({ message: 'Catégorie introuvable' });

    if (isDbConnected()) {
      await Category.findOneAndDelete({
        $or: [{ name: req.params.nameOrId }, { _id: req.params.nameOrId }]
      }).catch(e => console.warn(e));
    }

    res.json({ message: 'Catégorie supprimée avec succès' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
