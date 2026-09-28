
const Promotion = require('../models/Promotion');
const catchAsync = require('../utils/catchAsync');

exports.getPromotions = catchAsync(async (req, res) => {
  const promotions = await Promotion.find({});
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
