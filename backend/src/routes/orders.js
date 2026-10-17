
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

// Génération idempotente de facture
router.post('/:orderId/generate-invoice', (req, res) => {
  const { orderId } = req.params;
  const numFacture = `FACT-2026-${orderId.replace(/[^0-9]/g, '').slice(-4) || '0001'}`;
  res.json({
    success: true,
    facture: {
      numeroFacture: numFacture,
      dateEmission: new Date().toISOString().split('T')[0],
      statut: 'EMISE'
    }
  });
});

module.exports = router;
