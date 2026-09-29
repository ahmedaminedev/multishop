// Multi-Shop Filiale Resolver Middleware
// Identifies the active boutique (para, nutrition, cosmetic, electro)
// from Request Headers, Cookies, Query parameters, or defaults to 'para'.

const ALLOWED_SHOPS = ['para', 'nutrition', 'cosmetic', 'electro'];

function shopResolver(req, res, next) {
  let shopId = req.headers['x-shop-id'] || 
               req.cookies?.shop || 
               req.query?.shop;

  if (!shopId || !ALLOWED_SHOPS.includes(shopId)) {
    shopId = 'para';
  }

  req.shopId = shopId;
  res.setHeader('X-Active-Shop', shopId);
  next();
}

module.exports = shopResolver;
