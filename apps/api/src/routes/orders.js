const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const Order = require('../models/Order.model');
const { isDbConnected } = require('../config/db');

// GET /api/orders
router.get('/', (req, res) => {
  const storeSlug = req.storeSlug || req.query.storeSlug || null;
  const orders = dataStore.getOrders(storeSlug);
  res.json(orders);
});

// GET /api/orders/my-orders
router.get('/my-orders', (req, res) => {
  const storeSlug = req.storeSlug || req.query.storeSlug || null;
  const userEmail = req.user?.email || req.query.email;
  const orders = dataStore.getOrders(storeSlug, userEmail);
  res.json(orders);
});

// GET /api/orders/:id
router.get('/:id', (req, res) => {
  const storeSlug = req.storeSlug || req.query.storeSlug || null;
  const order = dataStore.getOrderById(req.params.id, storeSlug);
  if (!order) return res.status(404).json({ message: 'Commande introuvable' });
  res.json(order);
});

// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const storeSlug = req.storeSlug || req.body.storeSlug || 'parashop';
    const newOrder = dataStore.createOrder(req.body, storeSlug);
    if (isDbConnected()) {
      await Order.create(newOrder).catch(e => console.warn(e));
    }
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/orders/:id/status
router.put('/:id/status', (req, res) => {
  const storeSlug = req.storeSlug || req.body.storeSlug || null;
  const { status } = req.body;
  const updated = dataStore.updateOrderStatus(req.params.id, status, storeSlug);
  if (!updated) return res.status(404).json({ message: 'Commande introuvable' });
  res.json(updated);
});

module.exports = router;
