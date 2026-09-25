
const express = require('express');
const router = express.Router();
const { initiatePayment, handleWebhook } = require('../controllers/payment');
const { protect } = require('../middleware/auth');

router.post('/create', protect, initiatePayment);
router.post('/webhook', handleWebhook);

module.exports = router;
