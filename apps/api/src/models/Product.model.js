const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', index: true },
  storeSlug: { type: String, required: true, index: true }, // e.g. "parashop", "nutritionshop"
  id: { type: Number, required: true },
  name: { type: String, required: true },
  slug: { type: String },
  brand: { type: String, default: '' },
  price: { type: Number, required: true },
  oldPrice: { type: Number },
  imageUrl: { type: String, default: '' },
  images: [{ type: String }],
  discount: { type: Number, default: 0 },
  category: { type: String, required: true },
  parentCategory: { type: String },
  promo: { type: Boolean, default: false },
  material: { type: String },
  description: { type: String, default: '' },
  quantity: { type: Number, default: 0 },
  specifications: [{
    name: String,
    value: String,
    _id: false
  }],
  colors: [{
    name: String,
    hex: String,
    _id: false
  }],
  highlights: {
    title: { type: String, default: "Pourquoi on l'adore" },
    imageUrl: String,
    sections: [{
      subtitle: String,
      features: [{
        title: String,
        description: String,
        _id: false
      }],
      _id: false
    }]
  }
}, { timestamps: true });

productSchema.index({ storeSlug: 1, id: 1 }, { unique: true });
productSchema.index({ storeSlug: 1, category: 1 });

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
