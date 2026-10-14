
const Promotion = require('../models/Promotion');
const catchAsync = require('../utils/catchAsync');
const initialData = require('../data/initialData');
const mongoose = require('mongoose');

exports.getPromotions = catchAsync(async (req, res) => {
  const shop = req.query.shop || req.headers['x-shop-id'];
  let promotions = [];
  if (mongoose.connection.readyState === 1) {
    let filter = {};
    if (shop && shop !== 'all') {
      filter = { $or: [{ shop }, { filialeKey: shop }] };
    }
    promotions = await Promotion.find(filter).lean().catch(() => []);
  }
  if (!promotions || promotions.length === 0) {
    promotions = (initialData.promotions || []).filter(p => {
      if (!shop || shop === 'all') return true;
      return p.shop === shop || p.filialeKey === shop;
    });
  }
  res.json(promotions);
});

exports.createPromotion = catchAsync(async (req, res) => {
  const promotion = await Promotion.create(req.body);
  res.status(201).json(promotion);
});

exports.updatePromotion = catchAsync(async (req, res) => {
  const promotion = await Promotion.findOne({ id: req.params.id });
  if (promotion) {
    Object.assign(promotion, req.body);
    const updatedPromotion = await promotion.save();
    res.json(updatedPromotion);
  } else {
    res.status(404).json({ message: 'Promotion non trouvée' });
  }
});

exports.deletePromotion = catchAsync(async (req, res) => {
  const promotion = await Promotion.findOneAndDelete({ id: req.params.id });
  if (promotion) {
    res.json({ message: 'Promotion supprimée' });
  } else {
    res.status(404).json({ message: 'Promotion non trouvée' });
  }
});
