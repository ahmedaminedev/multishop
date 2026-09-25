const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', index: true },
  storeSlug: { type: String, required: true, index: true },
  productId: { type: Number, required: true },
  userName: { type: String, required: true },
  userEmail: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  verifiedPurchase: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const contactMessageSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', index: true },
  storeSlug: { type: String, required: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  subject: String,
  message: { type: String, required: true },
  status: { type: String, enum: ['NEW', 'READ', 'REPLIED'], default: 'NEW' },
  createdAt: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', index: true },
  storeSlug: { type: String, required: true, index: true },
  userId: { type: String, required: true },
  userEmail: String,
  userName: String,
  messages: [{
    sender: String,
    content: String,
    type: { type: String, default: 'text' },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }],
  lastUpdated: { type: Date, default: Date.now }
});

const offersConfigSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', index: true },
  storeSlug: { type: String, required: true, index: true },
  config: mongoose.Schema.Types.Mixed
});

module.exports = {
  Review: mongoose.models.Review || mongoose.model('Review', reviewSchema),
  ContactMessage: mongoose.models.ContactMessage || mongoose.model('ContactMessage', contactMessageSchema),
  Chat: mongoose.models.Chat || mongoose.model('Chat', chatSchema),
  OffersConfig: mongoose.models.OffersConfig || mongoose.model('OffersConfig', offersConfigSchema)
};
