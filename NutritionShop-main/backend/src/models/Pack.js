const mongoose = require('mongoose');

const PackSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  oldPrice: { type: Number, required: true },
  imageUrl: String,
  discount: Number,
  includedItems: [String],
  includedProductIds: [Number], // Using number IDs to match frontend logic
  includedPackIds: [Number]
}, { timestamps: true });

module.exports = mongoose.model('Pack', PackSchema);