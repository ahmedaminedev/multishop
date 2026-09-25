const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true }, // "parashop", "nutritionshop", "cosmeticshop", "electroshop"
  domain: { type: String, default: '' },
  currency: { type: String, default: 'TND' },
  themeColor: { type: String, default: '#008b5e' },
  description: { type: String, default: '' },
  logo: { type: String, default: '' },
  fbPixelId: { type: String, default: '' },
  active: { type: Boolean, default: true },
  contact: {
    email: { type: String, default: 'contact@multishop.tn' },
    phone: { type: String, default: '+216 71 000 000' },
    address: { type: String, default: 'Tunis, Tunisie' }
  }
}, { timestamps: true });

module.exports = mongoose.models.Store || mongoose.model('Store', storeSchema);
