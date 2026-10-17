
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const ContactMessage = require('../models/ContactMessage');
const catchAsync = require('../utils/catchAsync');

exports.getDashboardStats = catchAsync(async (req, res) => {
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 1) {
    const initialData = require('../data/initialData');
    const totalOrders = (initialData.sampleOrders || []).length;
    const totalProducts = (initialData.allProducts || []).length;
    const totalRevenue = (initialData.sampleOrders || []).reduce((acc, o) => acc + (Number(o.total || o.totalAmount) || 0), 0);
    return res.json({
      totalOrders,
      totalProducts,
      totalUsers: 15,
      totalRevenue,
      unreadMessages: (initialData.contactMessages || []).filter(m => !m.read).length
    });
  }
  const totalOrders = await Order.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalUsers = await User.countDocuments();
  
  // Calculate actual revenue
  const result = await Order.aggregate([
    {
        $match: { status: { $ne: 'Annulée' } }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$total" }
      }
    }
  ]);
  
  const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;
  const unreadMessages = await ContactMessage.countDocuments({ read: false });

  res.json({
    totalOrders,
    totalProducts,
    totalUsers,
    totalRevenue,
    unreadMessages
  });
});
