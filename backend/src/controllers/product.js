
const ProductService = require('../services/product.service');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const initialData = require('../data/initialData');
const mongoose = require('mongoose');

exports.getProducts = catchAsync(async (req, res) => {
  const shop = req.query.shop || req.headers['x-shop-id'];
  let filter = {};
  if (shop && shop !== 'all') {
    filter = { $or: [{ shop: shop }, { filialeKey: shop }] };
  }
  let products = [];
  if (mongoose.connection.readyState === 1) {
    products = await Product.find(filter).lean().catch(() => []);
  }
  if (!products || products.length === 0) {
    products = (initialData.allProducts || []).filter(p => {
      if (!shop || shop === 'all') return true;
      return p.shop === shop || p.filialeKey === shop;
    });
  }
  const normalized = products.map(p => {
    let itemShop = p.shop || p.filialeKey;
    if (!itemShop) {
      if (p.id >= 400 && p.id < 500) itemShop = 'youpi';
      else if (p.id >= 500 && p.id < 600) itemShop = 'dari';
      else itemShop = 'nutrition';
    }
    return {
      ...p,
      shop: itemShop,
      filialeKey: itemShop,
      quantité_enstock: p.quantité_enstock ?? p.quantity ?? 0,
      existe_dans_boutique: p.existe_dans_boutique !== false
    };
  });
  res.json(normalized);
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
