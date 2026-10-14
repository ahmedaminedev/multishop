
const Category = require('../models/Category');
const catchAsync = require('../utils/catchAsync');
const initialData = require('../data/initialData');
const mongoose = require('mongoose');

exports.getCategories = catchAsync(async (req, res) => {
  const shop = req.query.shop || req.headers['x-shop-id'];
  let categories = [];
  if (mongoose.connection.readyState === 1) {
    let filter = {};
    if (shop && shop !== 'all') {
      filter = { $or: [{ shop }, { filialeKey: shop }] };
    }
    categories = await Category.find(filter).lean().catch(() => []);
  }
  if (!categories || categories.length === 0) {
    categories = (initialData.categories || []).filter(c => {
      if (!shop || shop === 'all') return true;
      return c.shop === shop || c.filialeKey === shop;
    });
  }
  res.json(categories);
});

exports.createCategory = catchAsync(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json(category);
});

exports.updateCategory = catchAsync(async (req, res) => {
  // Assuming name is unique/key
  const category = await Category.findOne({ name: req.params.id }); 
  if (category) {
    Object.assign(category, req.body);
    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } else {
    res.status(404).json({ message: 'Catégorie non trouvée' });
  }
});

exports.deleteCategory = catchAsync(async (req, res) => {
  const category = await Category.findOneAndDelete({ name: req.params.id });
  if (category) {
    res.json({ message: 'Catégorie supprimée' });
  } else {
    res.status(404).json({ message: 'Catégorie non trouvée' });
  }
});
