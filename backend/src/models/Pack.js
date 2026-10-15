const mongoose = require('mongoose');

const PackSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.Mixed, unique: true, required: true },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  oldPrice: { type: Number, required: true },
  imageUrl: String,
  discount: Number,
  shop: { type: String, default: 'nutrition' },
  filialeKey: { type: String, default: 'nutrition' },
  includedItems: [String],
  includedProductIds: [Number], // Using number IDs to match frontend logic
  includedPackIds: [Number]
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Pack', PackSchema);