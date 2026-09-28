
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const ContactMessage = require('../models/ContactMessage');
const catchAsync = require('../utils/catchAsync');

exports.getDashboardStats = catchAsync(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalUsers = await User.countDocuments();
  
  // Calculate actual revenue (sum of 'total' field for all orders or just delivered ones)
  // Here we sum all for simplicity, or you can filter by status: 'Livrée'
  const result = await Order.aggregate([
    {
        $match: { status: { $ne: 'Annulée' } } // Exclude cancelled orders from revenue
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
