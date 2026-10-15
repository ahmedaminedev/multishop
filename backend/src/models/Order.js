const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  customerName: { type: String },
  customer: { type: mongoose.Schema.Types.Mixed },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: String },
  total: { type: Number },
  totalAmount: { type: Number },
  status: { type: String, default: 'En attente' },
  itemCount: { type: Number, default: 1 },
  items: { type: Array, default: [] },
  shippingAddress: { type: mongoose.Schema.Types.Mixed },
  paymentMethod: { type: String, default: 'Paiement à la livraison' },
  shop: { type: String, default: 'nutrition' },
  filialeKey: { type: String, default: 'nutrition' }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Order', OrderSchema);
