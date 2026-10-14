const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ProductSource = require('../models/ProductSource');
const FutureProduct = require('../models/FutureProduct');
const Supplier = require('../models/Supplier');

// GET /api/sources
router.get('/sources', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const list = await ProductSource.find({}).lean();
      return res.json(list);
    }
    res.json([]);
  } catch (err) {
    res.json([]);
  }
});

router.post('/sources', async (req, res) => {
  try {
    const created = await ProductSource.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/future-products
router.get('/future-products', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const list = await FutureProduct.find({}).lean();
      return res.json(list);
    }
    res.json([]);
  } catch (err) {
    res.json([]);
  }
});

router.post('/future-products', async (req, res) => {
  try {
    const created = await FutureProduct.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/suppliers
router.get('/suppliers', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const list = await Supplier.find({}).lean();
      return res.json(list);
    }
    res.json([]);
  } catch (err) {
    res.json([]);
  }
});

router.post('/suppliers', async (req, res) => {
  try {
    const created = await Supplier.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
