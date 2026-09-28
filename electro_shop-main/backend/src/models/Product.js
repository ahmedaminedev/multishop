
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true }, 
  name: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  oldPrice: Number,
  imageUrl: String, // Main thumbnail
  images: [String], // Gallery images
  discount: Number,
  category: { type: String, required: true },
  promo: { type: Boolean, default: false },
  material: String,
  description: String,
  quantity: { type: Number, required: true, default: 0 },
  // Flexible structure for specs
  specifications: [{
    name: String,
    value: String,
    _id: false
  }]
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
