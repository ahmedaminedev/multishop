const express = require('express');
const router = express.Router();
const {
  getDeliveries,
  getDeliveryById,
  createDelivery,
  updateDeliveryOrderStatus,
  uploadCarrierReceipt
} = require('../controllers/delivery');

router.get('/', getDeliveries);
router.post('/', createDelivery);
router.get('/:id', getDeliveryById);
router.post('/:id/orders/:orderId/status', updateDeliveryOrderStatus);
router.post('/:id/receipt', uploadCarrierReceipt);

module.exports = router;
