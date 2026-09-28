
const express = require('express');
const router = express.Router();
const { addOrderItems, getMyOrders, getOrders } = require('../controllers/order');
const { protect, admin } = require('../middleware/auth');

// Route racine /orders
router.route('/')
  .post(protect, addOrderItems)   // Tout utilisateur connecté peut créer une commande
  .get(protect, admin, getOrders); // Seul l'admin peut voir TOUTES les commandes

// Route utilisateur spécifique
router.route('/myorders')
  .get(protect, getMyOrders);     // Utilisateur voit SES commandes

module.exports = router;
