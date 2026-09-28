
const mongoose = require('mongoose');

// Singleton collection for all ads configuration
const AdvertisementSchema = new mongoose.Schema({
  heroSlides: [],
  audioPromo: [],
  promoBanners: [],
  smallPromoBanners: [],
  editorialCollage: [],
  shoppableVideos: [],
  trustBadges: [],
  newArrivals: Object,
  summerSelection: Object,
  virtualTryOn: Object,
  featuredGrid: Object
}, { strict: false });

module.exports = mongoose.model('Advertisement', AdvertisementSchema);
