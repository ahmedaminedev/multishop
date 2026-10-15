const mongoose = require('mongoose');

const PromotionSchema = new mongoose.Schema({
  id: mongoose.Schema.Types.Mixed,
  name: String,
  title: String,
  code: String,
  discount: Number,
  discountPercentage: Number,
  type: { type: String, default: 'percentage' },
  startDate: String,
  endDate: String,
  expirationDate: String,
  description: String,
  shop: { type: String, default: 'nutrition' },
  filialeKey: { type: String, default: 'nutrition' },
  productIds: [Number],
  packIds: [Number]
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Promotion', PromotionSchema);