const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', index: true },
  storeSlug: { type: String, required: true, index: true },
  id: { type: Number },
  title: { type: String, required: true },
  code: { type: String },
  discountPercentage: { type: Number, required: true },
  startDate: Date,
  endDate: Date,
  active: { type: Boolean, default: true },
  description: String,
  bannerImage: String,
  applicableCategories: [String]
}, { timestamps: true });

module.exports = mongoose.models.Promotion || mongoose.model('Promotion', promotionSchema);
