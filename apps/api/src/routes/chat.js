const express = require('express');
const router = express.Router();

const activeChats = new Map();

router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const chat = activeChats.get(userId) || { userId, messages: [] };
  res.json(chat);
});

router.post('/', (req, res) => {
  const { userId, sender, content, userEmail, userName } = req.body;
  let chat = activeChats.get(userId);
  if (!chat) {
    chat = { userId, userEmail, userName, messages: [] };
    activeChats.set(userId, chat);
  }
  const msg = {
    sender,
    content,
    type: 'text',
    timestamp: new Date().toISOString(),
    read: false
  };
  chat.messages.push(msg);
  res.status(201).json(msg);
});

module.exports = router;
