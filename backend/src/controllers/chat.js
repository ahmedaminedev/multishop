
const Chat = require('../models/Chat');
const catchAsync = require('../utils/catchAsync');

// Récupérer toutes les conversations (Pour l'admin)
exports.getAllChats = catchAsync(async (req, res) => {
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 1) {
    return res.json([]);
  }
  const chats = await Chat.find({}).sort({ lastUpdated: -1 });
  res.json(chats);
});

// Récupérer une conversation spécifique (Pour Client ou Admin)
exports.getChatByUserId = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 1) {
    return res.json({ messages: [] });
  }
  const chat = await Chat.findOne({ userId });
  
  if (!chat) {
    return res.json({ messages: [] });
  }
  
  res.json(chat);
});
