const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const Product = require('../models/Product.model');
const { isDbConnected } = require('../config/db');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const storeSlug = req.storeSlug || req.query.storeSlug || req.query.store || null;
    const products = dataStore.getProducts(storeSlug, req.query);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const storeSlug = req.storeSlug || req.query.storeSlug || null;
    const product = dataStore.getProductById(req.params.id, storeSlug);
    if (!product) return res.status(404).json({ message: 'Produit introuvable' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products
router.post('/', async (req, res) => {
  try {
    const storeSlug = req.storeSlug || req.body.storeSlug || 'parashop';
    const newProduct = dataStore.createProduct(req.body, storeSlug);
    if (isDbConnected()) {
      await Product.create(newProduct).catch(e => console.warn(e));
    }
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/products/:id
router.put('/:id', async (req, res) => {
  try {
    const storeSlug = req.storeSlug || req.body.storeSlug || null;
    const updated = dataStore.updateProduct(req.params.id, req.body, storeSlug);
    if (!updated) return res.status(404).json({ message: 'Produit introuvable' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    const storeSlug = req.storeSlug || req.query.storeSlug || null;
    const deleted = dataStore.deleteProduct(req.params.id, storeSlug);
    if (!deleted) return res.status(404).json({ message: 'Produit introuvable' });
    res.json({ message: 'Produit supprimé avec succès' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
