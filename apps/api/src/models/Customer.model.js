const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', index: true },
  storeSlug: { type: String, required: true, index: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  city: { type: String },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastOrderDate: { type: Date }
}, { timestamps: true });

customerSchema.index({ storeSlug: 1, email: 1 });

module.exports = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
