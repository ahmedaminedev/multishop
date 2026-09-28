
const Brand = require('../models/Brand');
const catchAsync = require('../utils/catchAsync');

exports.getBrands = catchAsync(async (req, res) => {
  const brands = await Brand.find({});
  res.json(brands);
});

exports.createBrand = catchAsync(async (req, res) => {
  const { name, logoUrl, associatedCategories } = req.body;
  
  const newBrand = await Brand.create({
    id: Date.now(),
    name,
    logoUrl,
    associatedCategories
  });

  res.status(201).json(newBrand);
});

exports.updateBrand = catchAsync(async (req, res) => {
  const brand = await Brand.findOne({ id: req.params.id });
  if (brand) {
    Object.assign(brand, req.body);
    const updatedBrand = await brand.save();
    res.json(updatedBrand);
  } else {
    res.status(404).json({ message: 'Marque non trouvée' });
  }
});

exports.deleteBrand = catchAsync(async (req, res) => {
  const brand = await Brand.findOneAndDelete({ id: req.params.id });
  if (brand) {
    res.json({ message: 'Marque supprimée' });
  } else {
    res.status(404).json({ message: 'Marque non trouvée' });
  }
});
