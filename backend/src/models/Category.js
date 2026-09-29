const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  subCategories: [String],
  megaMenu: [{
    title: String,
    items: [{ name: String }]
  }]
});

module.exports = mongoose.model('Category', CategorySchema);