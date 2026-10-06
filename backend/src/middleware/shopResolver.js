// Multi-Shop Filiale Resolver Middleware
// Identifies the active boutique (nutrition, youpi)
// from Request Headers, Cookies, Query parameters, or defaults to 'nutrition'.

const ALLOWED_SHOPS = ['nutrition', 'youpi'];

function shopResolver(req, res, next) {
  let shopId = req.headers['x-shop-id'] || 
               req.cookies?.shop || 
               req.query?.shop;

  if (!shopId || !ALLOWED_SHOPS.includes(shopId)) {
    shopId = 'nutrition';
  }

  req.shopId = shopId;
  res.setHeader('X-Active-Shop', shopId);
  next();
}

module.exports = shopResolver;

