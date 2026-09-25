const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', index: true },
  storeSlug: { type: String, required: true, index: true },
  id: { type: String, required: true },
  customer: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String },
    notes: { type: String }
  },
  items: [{
    id: Number,
    name: String,
    price: Number,
    quantity: Number,
    imageUrl: String,
    selectedColor: String,
    _id: false
  }],
  totalAmount: { type: Number, required: true },
  shippingCost: { type: Number, default: 7 },
  status: { 
    type: String, 
    enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING' 
  },
  paymentMethod: { type: String, default: 'CASH_ON_DELIVERY' },
  paymentStatus: { type: String, default: 'PENDING' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: { type: String }
}, { timestamps: true });

orderSchema.index({ storeSlug: 1, createdAt: -1 });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
