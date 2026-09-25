const mongoose = require('mongoose');

const packSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', index: true },
  storeSlug: { type: String, required: true, index: true },
  id: { type: Number, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  oldPrice: Number,
  discount: Number,
  imageUrl: String,
  images: [String],
  description: String,
  productIds: [Number],
  products: [{
    id: Number,
    name: String,
    price: Number,
    imageUrl: String,
    brand: String,
    _id: false
  }]
}, { timestamps: true });

packSchema.index({ storeSlug: 1, id: 1 }, { unique: true });

module.exports = mongoose.models.Pack || mongoose.model('Pack', packSchema);
