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
  isPickupPoint: Boolean
});

module.exports = mongoose.model('Store', StoreSchema);