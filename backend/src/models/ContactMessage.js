const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema({
  id: mongoose.Schema.Types.Mixed,
  name: String,
  email: String,
  subject: String,
  message: String,
  date: String,
  shop: { type: String, default: 'nutrition' },
  filialeKey: { type: String, default: 'nutrition' },
  read: { type: Boolean, default: false }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);