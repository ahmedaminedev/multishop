const mongoose = require('mongoose');

const PromotionSchema = new mongoose.Schema({
  id: mongoose.Schema.Types.Mixed,
  name: String,
  discountPercentage: Number,
  startDate: String,
  endDate: String,
  shop: { type: String, default: 'nutrition' },
  filialeKey: { type: String, default: 'nutrition' },
  productIds: [Number],
  packIds: [Number]
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Promotion', PromotionSchema);