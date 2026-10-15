const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.Mixed, unique: true },
  name: String,
  address: String,
  city: String,
  postalCode: String,
  phone: String,
  email: String,
  openingHours: String,
  hours: String,
  mapUrl: String,
  image: String,
  imageUrl: String,
  shop: { type: String, default: 'nutrition' },
  filialeKey: { type: String, default: 'nutrition' },
  isPickupPoint: Boolean
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Store', StoreSchema);