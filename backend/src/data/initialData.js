const nutritionData = require('./initialData_nutrition');
const youpiData = require('./initialData_youpi');
const dariData = require('./initialData_dari');

const tagShop = (items, shop) => (items || []).map(item => ({
  ...item,
  shop,
  filialeKey: shop
}));

const allProducts = [
  ...tagShop(nutritionData.allProducts, 'nutrition'),
  ...tagShop(youpiData.allProducts, 'youpi'),
  ...tagShop(dariData.allProducts, 'dari')
];

const categories = [
  ...tagShop(nutritionData.categories, 'nutrition'),
  ...tagShop(youpiData.categories, 'youpi'),
  ...tagShop(dariData.categories, 'dari')
];

const packs = [
  ...tagShop(nutritionData.packs, 'nutrition'),
  ...tagShop(youpiData.packs, 'youpi'),
  ...tagShop(dariData.packs, 'dari')
];

const stores = [
  ...tagShop(nutritionData.stores, 'nutrition'),
  ...tagShop(youpiData.stores, 'youpi'),
  ...tagShop(dariData.stores, 'dari')
];

const promotions = [
  ...tagShop(nutritionData.promotions, 'nutrition'),
  ...tagShop(youpiData.promotions, 'youpi'),
  ...tagShop(dariData.promotions, 'dari')
];

const sampleOrders = [
  ...tagShop(nutritionData.sampleOrders, 'nutrition'),
  ...tagShop(youpiData.sampleOrders, 'youpi'),
  ...tagShop(dariData.sampleOrders, 'dari')
];

const blogPosts = [
  ...tagShop(nutritionData.blogPosts, 'nutrition'),
  ...tagShop(youpiData.blogPosts, 'youpi'),
  ...tagShop(dariData.blogPosts, 'dari')
];

const contactMessages = [
  ...tagShop(nutritionData.contactMessages, 'nutrition'),
  ...tagShop(youpiData.contactMessages, 'youpi'),
  ...tagShop(dariData.contactMessages, 'dari')
];

module.exports = {
  allProducts,
  categories,
  packs,
  stores,
  initialAdvertisements: nutritionData.initialAdvertisements,
  promotions,
  sampleOrders,
  blogPosts,
  contactMessages
};
