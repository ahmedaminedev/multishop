
const Review = require('../models/Review');
const catchAsync = require('../utils/catchAsync');

exports.getReviews = catchAsync(async (req, res) => {
  const { targetId, targetType } = req.params;
  const reviews = await Review.find({ targetId, targetType }).sort({ date: -1 });
  res.json(reviews);
});

exports.createReview = catchAsync(async (req, res) => {
  const { targetId, targetType, rating, comment } = req.body;

  if (!req.user) {
      return res.status(401).json({ message: "Vous devez être connecté pour laisser un avis." });
  }

  const review = await Review.create({
    userId: req.user._id,
    userName: `${req.user.firstName} ${req.user.lastName}`,
    targetId,
    targetType,
    rating,
    comment
  });

  res.status(201).json(review);
});
