const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String },
  shop: { type: String, default: 'nutrition' },
  filialeKey: { type: String, default: 'nutrition' },
  ageRange: { type: String },
  icon: { type: String },
  color: { type: String },
  image: { type: String },
  description: { type: String },
  subCategories: [String],
  megaMenu: [{
    title: String,
    items: [{ name: String }]
  }]
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Category', CategorySchema);
