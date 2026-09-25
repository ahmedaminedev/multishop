const { STORES } = require('@multishop/shared');
const nutritionData = require('../data/nutritionData');
const paraData = require('../data/paraData');
const cosmeticData = require('../data/cosmeticData');
const electroData = require('../data/electroData');

const rawDatasets = {
  nutritionshop: nutritionData,
  parashop: paraData,
  cosmeticshop: cosmeticData,
  electroshop: electroData
};

class MultiTenantDataStore {
  constructor() {
    this.stores = [...STORES];
    this.products = [];
    this.categories = [];
    this.packs = [];
    this.promotions = [];
    this.advertisements = {};
    this.orders = [];
    this.blogPosts = [];
    this.contactMessages = [];
    this.brands = [];
    this.users = [
      {
        id: 'user_super_admin',
        _id: 'user_super_admin',
        name: 'Super Administrateur',
        email: 'admin@multishop.tn',
        password: '$2a$10$wO3P3nF9F9H2M9l5J9Lp7.bC0V7Oq6QY3k0qC/2X0x1.lM8Z5.eKG', // 'admin123'
        role: 'SUPER_ADMIN',
        storeSlug: null
      },
      {
        id: 'user_para_admin',
        _id: 'user_para_admin',
        name: 'Admin PharmaNature',
        email: 'admin@pharmanature.tn',
        password: '$2a$10$wO3P3nF9F9H2M9l5J9Lp7.bC0V7Oq6QY3k0qC/2X0x1.lM8Z5.eKG',
        role: 'STORE_ADMIN',
        storeSlug: 'parashop'
      },
      {
        id: 'user_nutrition_admin',
        _id: 'user_nutrition_admin',
        name: 'Admin IronFuel',
        email: 'admin@nutritionshop.tn',
        password: '$2a$10$wO3P3nF9F9H2M9l5J9Lp7.bC0V7Oq6QY3k0qC/2X0x1.lM8Z5.eKG',
        role: 'STORE_ADMIN',
        storeSlug: 'nutritionshop'
      },
      {
        id: 'user_cosmetic_admin',
        _id: 'user_cosmetic_admin',
        name: 'Admin Cosmetics',
        email: 'admin@cosmeticshop.tn',
        password: '$2a$10$wO3P3nF9F9H2M9l5J9Lp7.bC0V7Oq6QY3k0qC/2X0x1.lM8Z5.eKG',
        role: 'STORE_ADMIN',
        storeSlug: 'cosmeticshop'
      },
      {
        id: 'user_electro_admin',
        _id: 'user_electro_admin',
        name: 'Admin Electro',
        email: 'admin@electroshop.tn',
        password: '$2a$10$wO3P3nF9F9H2M9l5J9Lp7.bC0V7Oq6QY3k0qC/2X0x1.lM8Z5.eKG',
        role: 'STORE_ADMIN',
        storeSlug: 'electroshop'
      },
      {
        id: 'client_para',
        _id: 'client_para',
        name: 'Sarah Ben Mahmoud',
        email: 'client@pharmanature.tn',
        password: '$2a$10$wO3P3nF9F9H2M9l5J9Lp7.bC0V7Oq6QY3k0qC/2X0x1.lM8Z5.eKG', // 'client123'
        role: 'USER',
        storeSlug: 'parashop',
        phone: '+216 98 765 432',
        address: '15 Avenue Habib Bourguiba',
        city: 'Tunis'
      },
      {
        id: 'client_nutrition',
        _id: 'client_nutrition',
        name: 'Karim Trabelsi',
        email: 'client@nutritionshop.tn',
        password: '$2a$10$wO3P3nF9F9H2M9l5J9Lp7.bC0V7Oq6QY3k0qC/2X0x1.lM8Z5.eKG',
        role: 'USER',
        storeSlug: 'nutritionshop',
        phone: '+216 55 432 109',
        address: 'Rue du Lac Victoria',
        city: 'Berges du Lac'
      },
      {
        id: 'client_cosmetic',
        _id: 'client_cosmetic',
        name: 'Yasmine Gharbi',
        email: 'client@cosmeticshop.tn',
        password: '$2a$10$wO3P3nF9F9H2M9l5J9Lp7.bC0V7Oq6QY3k0qC/2X0x1.lM8Z5.eKG',
        role: 'USER',
        storeSlug: 'cosmeticshop',
        phone: '+216 22 110 998',
        address: 'Centre Urbain Nord',
        city: 'Tunis'
      },
      {
        id: 'client_electro',
        _id: 'client_electro',
        name: 'Mohamed Cherif',
        email: 'client@electroshop.tn',
        password: '$2a$10$wO3P3nF9F9H2M9l5J9Lp7.bC0V7Oq6QY3k0qC/2X0x1.lM8Z5.eKG',
        role: 'USER',
        storeSlug: 'electroshop',
        phone: '+216 99 887 766',
        address: 'Avenue de la Liberté',
        city: 'Ariana'
      }
    ];

    this.initialize();
  }

  initialize() {
    for (const [storeSlug, data] of Object.entries(rawDatasets)) {
      // Products
      if (Array.isArray(data.allProducts)) {
        data.allProducts.forEach(p => {
          this.products.push({
            ...p,
            _id: `${storeSlug}_prod_${p.id}`,
            storeSlug
          });
        });
      }

      // Categories
      if (Array.isArray(data.categories)) {
        data.categories.forEach((c, idx) => {
          this.categories.push({
            ...c,
            _id: `${storeSlug}_cat_${idx + 1}`,
            id: idx + 1,
            storeSlug
          });
        });
      }

      // Packs
      if (Array.isArray(data.packs)) {
        data.packs.forEach(pack => {
          this.packs.push({
            ...pack,
            _id: `${storeSlug}_pack_${pack.id}`,
            storeSlug
          });
        });
      }

      // Promotions
      if (Array.isArray(data.promotions)) {
        data.promotions.forEach((pr, idx) => {
          this.promotions.push({
            ...pr,
            _id: `${storeSlug}_promo_${idx + 1}`,
            id: pr.id || idx + 1,
            storeSlug
          });
        });
      }

      // Advertisements
      if (data.initialAdvertisements) {
        this.advertisements[storeSlug] = {
          ...data.initialAdvertisements,
          storeSlug
        };
      }

      // Orders
      if (Array.isArray(data.sampleOrders)) {
        data.sampleOrders.forEach(ord => {
          this.orders.push({
            ...ord,
            _id: `${storeSlug}_ord_${ord.id}`,
            storeSlug,
            status: ord.status || 'CONFIRMED'
          });
        });
      }

      // Blog posts
      if (Array.isArray(data.blogPosts)) {
        data.blogPosts.forEach(post => {
          this.blogPosts.push({
            ...post,
            _id: `${storeSlug}_blog_${post.id || post.slug}`,
            storeSlug
          });
        });
      }

      // Contact messages
      if (Array.isArray(data.contactMessages)) {
        data.contactMessages.forEach((msg, idx) => {
          this.contactMessages.push({
            ...msg,
            _id: `${storeSlug}_msg_${idx + 1}`,
            id: idx + 1,
            storeSlug
          });
        });
      }

      // Extract brands from products
      if (Array.isArray(data.allProducts)) {
        const uniqueBrands = [...new Set(data.allProducts.map(p => p.brand).filter(Boolean))];
        uniqueBrands.forEach((bName, bIdx) => {
          this.brands.push({
            id: bIdx + 1,
            name: bName,
            storeSlug,
            featured: true
          });
        });
      }
    }
    console.log(`[MultiShop DataStore] Initialisé avec ${this.stores.length} boutiques, ${this.products.length} produits, ${this.categories.length} catégories.`);
  }

  // Filter helper
  filterByStore(items, storeSlug) {
    if (!storeSlug || storeSlug === 'all') return items;
    return items.filter(item => item.storeSlug === storeSlug);
  }

  // --- STORES ---
  getStores() {
    return this.stores;
  }

  getStore(slug) {
    return this.stores.find(s => s.slug === slug || s.id === slug) || null;
  }

  createStore(storeData) {
    const slug = storeData.slug || storeData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newStore = {
      id: slug,
      slug,
      name: storeData.name,
      subtitle: storeData.subtitle || '',
      themeColor: storeData.themeColor || '#2563eb',
      secondaryColor: storeData.secondaryColor || '#1e40af',
      path: `/${slug}`,
      description: storeData.description || '',
      currency: storeData.currency || 'TND',
      categoryTheme: storeData.categoryTheme || 'Général',
      active: true,
      createdAt: new Date().toISOString()
    };
    this.stores.push(newStore);
    return newStore;
  }

  updateStore(slug, updates) {
    const idx = this.stores.findIndex(s => s.slug === slug || s.id === slug);
    if (idx !== -1) {
      this.stores[idx] = { ...this.stores[idx], ...updates };
      return this.stores[idx];
    }
    return null;
  }

  // --- PRODUCTS ---
  getProducts(storeSlug, query = {}) {
    let list = this.filterByStore(this.products, storeSlug);
    if (query.category) {
      list = list.filter(p => p.category?.toLowerCase() === query.category.toLowerCase() || p.parentCategory?.toLowerCase() === query.category.toLowerCase());
    }
    if (query.brand) {
      list = list.filter(p => p.brand?.toLowerCase() === query.brand.toLowerCase());
    }
    if (query.promo === 'true' || query.promo === true) {
      list = list.filter(p => p.promo);
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      list = list.filter(p => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));
    }
    return list;
  }

  getProductById(id, storeSlug) {
    const numId = Number(id);
    return this.products.find(p => (p.id === numId || p._id === id) && (!storeSlug || storeSlug === 'all' || p.storeSlug === storeSlug)) || null;
  }

  createProduct(productData, storeSlug) {
    const targetSlug = storeSlug || productData.storeSlug || 'parashop';
    const storeProducts = this.products.filter(p => p.storeSlug === targetSlug);
    const maxId = storeProducts.length > 0 ? Math.max(...storeProducts.map(p => p.id || 0)) : 0;
    const newProduct = {
      ...productData,
      id: productData.id || maxId + 1,
      _id: `${targetSlug}_prod_${maxId + 1}`,
      storeSlug: targetSlug,
      createdAt: new Date().toISOString()
    };
    this.products.unshift(newProduct);
    return newProduct;
  }

  updateProduct(id, updates, storeSlug) {
    const numId = Number(id);
    const idx = this.products.findIndex(p => (p.id === numId || p._id === id) && (!storeSlug || storeSlug === 'all' || p.storeSlug === storeSlug));
    if (idx !== -1) {
      this.products[idx] = { ...this.products[idx], ...updates };
      return this.products[idx];
    }
    return null;
  }

  deleteProduct(id, storeSlug) {
    const numId = Number(id);
    const initialLen = this.products.length;
    this.products = this.products.filter(p => !((p.id === numId || p._id === id) && (!storeSlug || storeSlug === 'all' || p.storeSlug === storeSlug)));
    return this.products.length < initialLen;
  }

  // --- CATEGORIES & SUB-CATEGORIES ---
  getCategories(storeSlug) {
    return this.filterByStore(this.categories, storeSlug);
  }

  getCategoryByNameOrId(nameOrId, storeSlug) {
    const term = String(nameOrId).toLowerCase().trim();
    return this.categories.find(c => 
      (c._id === nameOrId || c.id == nameOrId || c.name.toLowerCase() === term) &&
      (!storeSlug || storeSlug === 'all' || c.storeSlug === storeSlug)
    ) || null;
  }

  createCategory(categoryData, storeSlug) {
    const targetSlug = storeSlug || categoryData.storeSlug || 'parashop';
    const newCategory = {
      ...categoryData,
      _id: `${targetSlug}_cat_${Date.now()}`,
      id: Date.now(),
      name: categoryData.name,
      subCategories: Array.isArray(categoryData.subCategories) ? categoryData.subCategories : [],
      megaMenu: Array.isArray(categoryData.megaMenu) ? categoryData.megaMenu : undefined,
      storeSlug: targetSlug,
      createdAt: new Date().toISOString()
    };
    this.categories.push(newCategory);
    return newCategory;
  }

  updateCategory(nameOrId, updates, storeSlug) {
    const term = String(nameOrId).toLowerCase().trim();
    const idx = this.categories.findIndex(c => 
      (c._id === nameOrId || c.id == nameOrId || c.name.toLowerCase() === term) &&
      (!storeSlug || storeSlug === 'all' || c.storeSlug === storeSlug)
    );
    if (idx !== -1) {
      this.categories[idx] = {
        ...this.categories[idx],
        ...updates,
        name: updates.name || this.categories[idx].name,
        subCategories: updates.subCategories !== undefined ? updates.subCategories : this.categories[idx].subCategories,
        megaMenu: updates.megaMenu !== undefined ? updates.megaMenu : this.categories[idx].megaMenu
      };
      return this.categories[idx];
    }
    return null;
  }

  deleteCategory(nameOrId, storeSlug) {
    const term = String(nameOrId).toLowerCase().trim();
    const initialLen = this.categories.length;
    this.categories = this.categories.filter(c => 
      !((c._id === nameOrId || c.id == nameOrId || c.name.toLowerCase() === term) &&
      (!storeSlug || storeSlug === 'all' || c.storeSlug === storeSlug))
    );
    return this.categories.length < initialLen;
  }

  // --- PACKS ---
  getPacks(storeSlug) {
    return this.filterByStore(this.packs, storeSlug);
  }

  getPackById(id, storeSlug) {
    const numId = Number(id);
    return this.packs.find(p => (p.id === numId || p._id === id) && (!storeSlug || storeSlug === 'all' || p.storeSlug === storeSlug)) || null;
  }

  createPack(packData, storeSlug) {
    const targetSlug = storeSlug || packData.storeSlug || 'parashop';
    const storePacks = this.packs.filter(p => p.storeSlug === targetSlug);
    const maxId = storePacks.length > 0 ? Math.max(...storePacks.map(p => p.id || 0)) : 0;
    const newPack = {
      ...packData,
      id: packData.id || maxId + 1,
      _id: `${targetSlug}_pack_${maxId + 1}`,
      storeSlug: targetSlug,
      createdAt: new Date().toISOString()
    };
    this.packs.unshift(newPack);
    return newPack;
  }

  updatePack(id, updates, storeSlug) {
    const numId = Number(id);
    const idx = this.packs.findIndex(p => (p.id === numId || p._id === id) && (!storeSlug || storeSlug === 'all' || p.storeSlug === storeSlug));
    if (idx !== -1) {
      this.packs[idx] = { ...this.packs[idx], ...updates };
      return this.packs[idx];
    }
    return null;
  }

  deletePack(id, storeSlug) {
    const numId = Number(id);
    const initialLen = this.packs.length;
    this.packs = this.packs.filter(p => !((p.id === numId || p._id === id) && (!storeSlug || storeSlug === 'all' || p.storeSlug === storeSlug)));
    return this.packs.length < initialLen;
  }

  // --- ADVERTISEMENTS ---
  getAdvertisements(storeSlug) {
    const slug = storeSlug || 'parashop';
    return this.advertisements[slug] || this.advertisements['parashop'] || {};
  }

  updateAdvertisements(storeSlug, adsData) {
    const slug = storeSlug || 'parashop';
    this.advertisements[slug] = {
      ...this.advertisements[slug],
      ...adsData,
      storeSlug: slug
    };
    return this.advertisements[slug];
  }

  // --- PROMOTIONS ---
  getPromotions(storeSlug) {
    return this.filterByStore(this.promotions, storeSlug);
  }

  createPromotion(promoData, storeSlug) {
    const targetSlug = storeSlug || promoData.storeSlug || 'parashop';
    const newPromo = {
      ...promoData,
      id: promoData.id || Date.now(),
      _id: `${targetSlug}_promo_${Date.now()}`,
      storeSlug: targetSlug,
      createdAt: new Date().toISOString()
    };
    this.promotions.push(newPromo);
    return newPromo;
  }

  updatePromotion(id, updates, storeSlug) {
    const numId = Number(id);
    const idx = this.promotions.findIndex(p => (p.id === numId || p._id === id) && (!storeSlug || storeSlug === 'all' || p.storeSlug === storeSlug));
    if (idx !== -1) {
      this.promotions[idx] = { ...this.promotions[idx], ...updates };
      return this.promotions[idx];
    }
    return null;
  }

  deletePromotion(id, storeSlug) {
    const numId = Number(id);
    const initialLen = this.promotions.length;
    this.promotions = this.promotions.filter(p => !((p.id === numId || p._id === id) && (!storeSlug || storeSlug === 'all' || p.storeSlug === storeSlug)));
    return this.promotions.length < initialLen;
  }

  // --- BRANDS ---
  getBrands(storeSlug) {
    return this.filterByStore(this.brands, storeSlug);
  }

  createBrand(brandData, storeSlug) {
    const targetSlug = storeSlug || brandData.storeSlug || 'parashop';
    const newBrand = {
      ...brandData,
      id: brandData.id || Date.now(),
      _id: `${targetSlug}_brand_${Date.now()}`,
      storeSlug: targetSlug,
      featured: brandData.featured !== undefined ? brandData.featured : true
    };
    this.brands.push(newBrand);
    return newBrand;
  }

  updateBrand(id, updates, storeSlug) {
    const numId = Number(id);
    const idx = this.brands.findIndex(b => (b.id === numId || b._id === id || b.name === id) && (!storeSlug || storeSlug === 'all' || b.storeSlug === storeSlug));
    if (idx !== -1) {
      this.brands[idx] = { ...this.brands[idx], ...updates };
      return this.brands[idx];
    }
    return null;
  }

  deleteBrand(id, storeSlug) {
    const numId = Number(id);
    const initialLen = this.brands.length;
    this.brands = this.brands.filter(b => !((b.id === numId || b._id === id || b.name === id) && (!storeSlug || storeSlug === 'all' || b.storeSlug === storeSlug)));
    return this.brands.length < initialLen;
  }

  // --- ORDERS ---
  getOrders(storeSlug, userEmail) {
    let list = this.filterByStore(this.orders, storeSlug);
    if (userEmail) {
      list = list.filter(o => o.customer?.email === userEmail || o.userEmail === userEmail);
    }
    return list;
  }

  getOrderById(id, storeSlug) {
    return this.orders.find(o => (o.id === id || o._id === id) && (!storeSlug || storeSlug === 'all' || o.storeSlug === storeSlug)) || null;
  }

  createOrder(orderData, storeSlug) {
    const targetSlug = storeSlug || orderData.storeSlug || 'parashop';
    const newOrder = {
      ...orderData,
      id: orderData.id || `ORD-${Date.now()}`,
      _id: `ord_${Date.now()}`,
      storeSlug: targetSlug,
      status: orderData.status || 'PENDING',
      createdAt: new Date().toISOString()
    };
    this.orders.unshift(newOrder);
    return newOrder;
  }

  updateOrderStatus(id, status, storeSlug) {
    const idx = this.orders.findIndex(o => (o.id === id || o._id === id) && (!storeSlug || storeSlug === 'all' || o.storeSlug === storeSlug));
    if (idx !== -1) {
      this.orders[idx].status = status;
      return this.orders[idx];
    }
    return null;
  }

  // --- BRANDS ---
  getBrands(storeSlug) {
    return this.filterByStore(this.brands, storeSlug);
  }

  // --- BLOG ---
  getBlogPosts(storeSlug) {
    return this.filterByStore(this.blogPosts, storeSlug);
  }

  getBlogPostBySlug(slug, storeSlug) {
    return this.blogPosts.find(b => (b.slug === slug || b.id === Number(slug)) && (!storeSlug || storeSlug === 'all' || b.storeSlug === storeSlug)) || null;
  }

  // --- CONTACT ---
  createContactMessage(msgData, storeSlug) {
    const targetSlug = storeSlug || msgData.storeSlug || 'parashop';
    const newMsg = {
      ...msgData,
      id: Date.now(),
      _id: `msg_${Date.now()}`,
      storeSlug: targetSlug,
      status: 'NEW',
      createdAt: new Date().toISOString()
    };
    this.contactMessages.unshift(newMsg);
    return newMsg;
  }

  getContactMessages(storeSlug) {
    return this.filterByStore(this.contactMessages, storeSlug);
  }

  updateContactMessage(id, updates, storeSlug) {
    const numId = Number(id);
    const idx = this.contactMessages.findIndex(m => (m.id === numId || m._id === id) && (!storeSlug || storeSlug === 'all' || m.storeSlug === storeSlug));
    if (idx !== -1) {
      this.contactMessages[idx] = { ...this.contactMessages[idx], ...updates };
      return this.contactMessages[idx];
    }
    return null;
  }

  deleteContactMessage(id, storeSlug) {
    const numId = Number(id);
    const initialLen = this.contactMessages.length;
    this.contactMessages = this.contactMessages.filter(m => !((m.id === numId || m._id === id) && (!storeSlug || storeSlug === 'all' || m.storeSlug === storeSlug)));
    return this.contactMessages.length < initialLen;
  }

  // --- DASHBOARD ANALYTICS ---
  getDashboardStats(storeSlug) {
    const filteredOrders = this.filterByStore(this.orders, storeSlug);
    const filteredProducts = this.filterByStore(this.products, storeSlug);
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const totalOrders = filteredOrders.length;
    const totalProducts = filteredProducts.length;

    // Per store breakdown
    const storesBreakdown = this.stores.map(store => {
      const sOrders = this.orders.filter(o => o.storeSlug === store.slug);
      const sRevenue = sOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
      const sProducts = this.products.filter(p => p.storeSlug === store.slug);
      return {
        storeSlug: store.slug,
        storeName: store.name,
        themeColor: store.themeColor,
        revenue: Math.round(sRevenue * 100) / 100,
        ordersCount: sOrders.length,
        productsCount: sProducts.length
      };
    });

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      totalProducts,
      storesCount: this.stores.length,
      storesBreakdown,
      recentOrders: filteredOrders.slice(0, 5)
    };
  }
}

const dataStore = new MultiTenantDataStore();

module.exports = dataStore;
