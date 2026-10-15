const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: String,
  address: String,
  city: String,
  postalCode: String,
  phone: String,
  email: String,
  openingHours: String,
  mapUrl: String,
  imageUrl: String,
  shop: { type: String, default: 'nutrition' },
  filialeKey: { type: String, default: 'nutrition' },
  isPickupPoint: Boolean
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Store', StoreSchema);