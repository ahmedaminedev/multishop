
const Product = require('../models/Product');

class ProductService {
  async getAllProducts() {
    return await Product.find({});
  }

  async getProductById(id) {
    return await Product.findOne({ id });
  }

  async createProduct(productData) {
    // Auto-generate numeric ID if missing
    if (!productData.id) {
        productData.id = Date.now();
    }
    // Ensure imageUrl is set from the first image of the gallery
    if (productData.images && productData.images.length > 0 && !productData.imageUrl) {
        productData.imageUrl = productData.images[0];
    }
    const product = new Product(productData);
    return await product.save();
  }

  async updateProduct(id, updateData) {
    const product = await Product.findOne({ id });
    if (!product) return null;

    if (updateData.images && updateData.images.length > 0) {
        updateData.imageUrl = updateData.images[0];
    }
    
    Object.assign(product, updateData);
    return await product.save();
  }

  async deleteProduct(id) {
    return await Product.findOneAndDelete({ id });
  }
}

module.exports = new ProductService();
