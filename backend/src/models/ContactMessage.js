const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema({
  id: Number,
  name: String,
  email: String,
  subject: String,
  message: String,
  date: String,
  read: { type: Boolean, default: false }
});

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);