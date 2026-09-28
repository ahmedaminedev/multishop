
const express = require('express');
const router = express.Router();
const { getAllChats, getChatByUserId } = require('../controllers/chat');
const { protect, admin } = require('../middleware/auth');

// Admin routes
router.get('/all', protect, admin, getAllChats);

// Client/Shared routes
router.get('/:userId', protect, getChatByUserId);

module.exports = router;
