const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', index: true },
  storeSlug: { type: String, required: true, index: true },
  name: { type: String, required: true },
  slug: { type: String },
  icon: { type: String, default: '' },
  subCategories: [{ type: String }],
  megaMenu: [{
    title: String,
    items: [{
      name: String,
      link: String,
      _id: false
    }],
    _id: false
  }]
}, { timestamps: true });

categorySchema.index({ storeSlug: 1, name: 1 }, { unique: true });

module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);
