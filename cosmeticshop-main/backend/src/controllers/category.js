
const Category = require('../models/Category');
const catchAsync = require('../utils/catchAsync');

exports.getCategories = catchAsync(async (req, res) => {
  const categories = await Category.find({});
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
