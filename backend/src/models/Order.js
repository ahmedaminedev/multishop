
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true }, // ES-XXXX string ID
  customerName: { type: String, required: true },
  // IMPORTANT: Link to the real User model
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ['En attente', 'Expédiée', 'Livrée', 'Annulée'], default: 'En attente' },
  itemCount: { type: Number, required: true },
  // Define items as an array explicitly
  items: { type: Array, default: [] }, 
  shippingAddress: { type: mongoose.Schema.Types.Mixed, required: true }, 
  paymentMethod: { type: String, required: true }
}, { timestamps: true, strict: false }); 

module.exports = mongoose.model('Order', OrderSchema);
