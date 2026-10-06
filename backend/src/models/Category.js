const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String },
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
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
