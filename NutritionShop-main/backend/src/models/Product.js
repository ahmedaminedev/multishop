
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
  category: { type: String, required: true }, // This will effectively be the Sub-Category
  parentCategory: { type: String }, // New field for Main Category
  promo: { type: Boolean, default: false },
  material: String,
  description: String,
  quantity: { type: Number, required: true, default: 0 },
  // Flexible structure for specs
  specifications: [{
    name: String,
    value: String,
    _id: false
  }],
  // Colors array
  colors: [{
    name: String,
    hex: String,
    _id: false
  }],
  // New Editorial Block Structure (Why we love it)
  highlights: {
    title: { type: String, default: 'Pourquoi on l\'adore' },
    imageUrl: String,
    sections: [{
      subtitle: String, // e.g. "Precision Pout Lip Liner"
      features: [{
        title: String, // e.g. "Comfortable formula"
        description: String, // e.g. "Sculpts, defines..."
        _id: false
      }],
      _id: false
    }]
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);