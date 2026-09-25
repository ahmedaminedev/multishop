
const express = require('express');
const router = express.Router();
const { getMessages, createMessage } = require('../controllers/contact');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .get(protect, admin, getMessages)
  .post(createMessage);

module.exports = router;
