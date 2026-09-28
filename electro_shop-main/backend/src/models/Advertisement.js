const mongoose = require('mongoose');

// Singleton collection for all ads configuration
const AdvertisementSchema = new mongoose.Schema({
  heroSlides: [],
  destockage: [],
  audioPromo: [],
  promoBanners: [],
  smallPromoBanners: []
});

module.exports = mongoose.model('Advertisement', AdvertisementSchema);