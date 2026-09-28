
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');

exports.getProducts = catchAsync(async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

exports.getProductById = catchAsync(async (req, res) => {
  const product = await Product.findOne({ id: req.params.id });
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Produit non trouvé' });
  }
});

exports.createProduct = catchAsync(async (req, res) => {
  const productData = req.body;
  
  // Auto-generate numeric ID if missing
  if (!productData.id) {
      productData.id = Date.now();
  }

  // Ensure imageUrl is set from the first image of the gallery if available
  if (productData.images && productData.images.length > 0 && !productData.imageUrl) {
      productData.imageUrl = productData.images[0];
  }

  const product = new Product(productData);
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

exports.updateProduct = catchAsync(async (req, res) => {
  const product = await Product.findOne({ id: req.params.id });
  if (product) {
    // Logic to keep imageUrl consistent
    if (req.body.images && req.body.images.length > 0) {
        req.body.imageUrl = req.body.images[0];
    }
    
    Object.assign(product, req.body);
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404).json({ message: 'Produit non trouvé' });
  }
});

exports.deleteProduct = catchAsync(async (req, res) => {
  const product = await Product.findOneAndDelete({ id: req.params.id });
  if (product) {
    res.json({ message: 'Produit supprimé' });
  } else {
    res.status(404).json({ message: 'Produit non trouvé' });
  }
});
