
const ContactMessage = require('../models/ContactMessage');
const catchAsync = require('../utils/catchAsync');

exports.getMessages = catchAsync(async (req, res) => {
  const shop = req.query.shop || req.headers['x-shop-id'];
  let filter = {};
  if (shop && shop !== 'all') {
    filter = { $or: [{ shop }, { filialeKey: shop }] };
  }
  let messages = [];
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      messages = await ContactMessage.find(filter).sort({ date: -1 });
    }
  } catch {}

  if (!messages || messages.length === 0) {
    const initialData = require('../data/initialData');
    messages = (initialData.contactMessages || []).filter(m => {
      if (!shop || shop === 'all') return true;
      return m.shop === shop || m.filialeKey === shop;
    });
  }
  res.json(messages);
});

exports.createMessage = catchAsync(async (req, res) => {
  const { name, email, subject, message } = req.body;
  
  // Validation Backend
  if (!name || !email || !message) {
      return res.status(400).json({ message: "Nom, Email et Message sont obligatoires." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Format d'email invalide." });
  }

  // Enregistre le nouveau message dans MongoDB
  const newMessage = await ContactMessage.create({
      id: Date.now(),
      name,
      email,
      subject,
      message,
      date: new Date().toISOString().split('T')[0],
      read: false
  });

  res.status(201).json(newMessage);
});
