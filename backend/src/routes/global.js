const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const initialData = require('../data/initialData');

// Helper to normalize product format
function normalizeProduct(p) {
  let shop = p.shop || p.filialeKey;
  if (!shop) {
    if (p.id >= 400 && p.id < 500) shop = 'youpi';
    else if (p.id >= 500 && p.id < 600) shop = 'dari';
    else shop = 'nutrition';
  }
  return {
    ...p,
    shop,
    filialeKey: shop,
    quantité_enstock: p.quantité_enstock ?? p.quantity ?? 0,
    existe_dans_boutique: p.existe_dans_boutique !== false
  };
}

// GET /api/global/products - Retourne les produits réels de la base MongoDB
router.get('/products', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const products = await Product.find({}).lean();
      if (products.length > 0) {
        return res.json(products.map(normalizeProduct));
      }
    }
    // Fallback if DB is empty or offline
    res.json((initialData.allProducts || []).map(normalizeProduct));
  } catch (err) {
    res.json((initialData.allProducts || []).map(normalizeProduct));
  }
});

// GET /api/global/orders - Retourne les commandes réelles de la base MongoDB
router.get('/orders', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const orders = await Order.find({}).lean();
      return res.json(orders);
    }
    res.json(initialData.sampleOrders || []);
  } catch (err) {
    res.json(initialData.sampleOrders || []);
  }
});

// GET /api/global/stats - Statistiques consolidées calculées 100% sur la base MongoDB
router.get('/stats', async (req, res) => {
  try {
    let products = [];
    let orders = [];
    let users = [];

    if (mongoose.connection.readyState === 1) {
      [products, orders, users] = await Promise.all([
        Product.find({}).lean().catch(() => []),
        Order.find({}).lean().catch(() => []),
        User.find({}).lean().catch(() => [])
      ]);
    }

    if (products.length === 0) products = initialData.allProducts || [];
    if (orders.length === 0) orders = initialData.sampleOrders || [];

    const filiales = {
      nutrition: { revenue: 0, ordersCount: 0, productsCount: 0, pendingOrdersCount: 0 },
      youpi: { revenue: 0, ordersCount: 0, productsCount: 0, pendingOrdersCount: 0 },
      dari: { revenue: 0, ordersCount: 0, productsCount: 0, pendingOrdersCount: 0 }
    };

    products.forEach(p => {
      let shop = p.shop || p.filialeKey;
      if (!shop) {
        if (p.id >= 400 && p.id < 500) shop = 'youpi';
        else if (p.id >= 500 && p.id < 600) shop = 'dari';
        else shop = 'nutrition';
      }
      if (filiales[shop]) {
        filiales[shop].productsCount += 1;
      }
    });

    let totalRevenue = 0;
    orders.forEach(o => {
      const shop = o.shop || o.filialeKey || 'nutrition';
      const amt = Number(o.total || o.totalAmount) || 0;
      totalRevenue += amt;
      if (filiales[shop]) {
        filiales[shop].revenue += amt;
        filiales[shop].ordersCount += 1;
        if (['En attente', 'en_attente', 'Expédiée', 'confirmé'].includes(o.status)) {
          filiales[shop].pendingOrdersCount += 1;
        }
      }
    });

    res.json({
      totalRevenue,
      totalOrders: orders.length,
      totalProducts: products.length,
      totalClients: users.filter(u => u.role !== 'ADMIN').length || 15,
      filiales
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
