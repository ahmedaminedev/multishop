
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['client', 'admin'], required: true },
  content: { type: String }, // Texte ou Base64 de l'image
  type: { type: String, enum: ['text', 'image', 'video'], default: 'text' },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

const ChatSchema = new mongoose.Schema({
  // On utilise String au lieu de ObjectId pour accepter n'importe quel format d'ID venant du frontend
  userId: { type: String, required: true, unique: true },
  userEmail: String, // Pour affichage rapide coté admin
  userName: String,
  messages: [MessageSchema],
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);
