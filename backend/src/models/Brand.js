
const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  name: { type: String, required: true },
  logoUrl: String,
  // Liste des liaisons : quelle catégorie parente et quelle sous-catégorie
  associatedCategories: [{
    parentCategory: String,
    subCategory: String,
    _id: false
  }]
}, { timestamps: true });

module.exports = mongoose.model('Brand', BrandSchema);
