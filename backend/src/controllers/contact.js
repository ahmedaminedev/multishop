
const ContactMessage = require('../models/ContactMessage');
const catchAsync = require('../utils/catchAsync');

exports.getMessages = catchAsync(async (req, res) => {
  // Récupère les messages stockés dans MongoDB, triés par date
  const messages = await ContactMessage.find({}).sort({ date: -1 });
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
