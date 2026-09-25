
const ProductService = require('../services/product.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getProducts = catchAsync(async (req, res) => {
  const products = await ProductService.getAllProducts();
  res.json(products);
});

exports.getProductById = catchAsync(async (req, res, next) => {
  const product = await ProductService.getProductById(req.params.id);
  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }
  res.json(product);
});

exports.createProduct = catchAsync(async (req, res) => {
  const createdProduct = await ProductService.createProduct(req.body);
  res.status(201).json(createdProduct);
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const updatedProduct = await ProductService.updateProduct(req.params.id, req.body);
  if (!updatedProduct) {
    return next(new AppError('Produit non trouvé', 404));
  }
  res.json(updatedProduct);
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await ProductService.deleteProduct(req.params.id);
  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }
  res.json({ message: 'Produit supprimé' });
});
