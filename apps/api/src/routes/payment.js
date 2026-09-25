const express = require('express');
const router = express.Router();

router.post('/create-checkout-session', (req, res) => {
  const { orderId, amount } = req.body;
  res.json({
    success: true,
    orderId,
    paymentUrl: `#/checkout?payment=success&orderId=${orderId}`
  });
});

module.exports = router;
