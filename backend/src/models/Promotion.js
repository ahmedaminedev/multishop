const mongoose = require('mongoose');

const PromotionSchema = new mongoose.Schema({
  id: Number,
  name: String,
  discountPercentage: Number,
  startDate: String,
  endDate: String,
  productIds: [Number],
  packIds: [Number]
});

module.exports = mongoose.model('Promotion', PromotionSchema);