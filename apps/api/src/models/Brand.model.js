const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', index: true },
  storeSlug: { type: String, required: true, index: true },
  id: Number,
  name: { type: String, required: true },
  logoUrl: String,
  featured: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.models.Brand || mongoose.model('Brand', brandSchema);
