const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', index: true },
  storeSlug: { type: String, required: true, index: true },
  heroSlides: [mongoose.Schema.Types.Mixed],
  audioPromo: [mongoose.Schema.Types.Mixed],
  promoBanners: [mongoose.Schema.Types.Mixed],
  smallPromoBanners: [mongoose.Schema.Types.Mixed],
  editorialCollage: [mongoose.Schema.Types.Mixed],
  shoppableVideos: [mongoose.Schema.Types.Mixed],
  trustBadges: [mongoose.Schema.Types.Mixed],
  newArrivals: mongoose.Schema.Types.Mixed,
  summerSelection: mongoose.Schema.Types.Mixed,
  virtualTryOn: mongoose.Schema.Types.Mixed,
  featuredGrid: mongoose.Schema.Types.Mixed
}, { timestamps: true });

module.exports = mongoose.models.Advertisement || mongoose.model('Advertisement', advertisementSchema);
