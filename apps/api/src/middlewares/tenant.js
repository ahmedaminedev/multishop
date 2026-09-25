const { STORES } = require('@multishop/shared');
const Store = require('../models/Store.model');
const { isDbConnected } = require('../config/db');

module.exports = async function tenant(req, res, next) {
  // Read tenant from header x-store-slug, query param, or cookies
  const headerSlug = req.headers['x-store-slug'] || req.headers['x-store-id'];
  const querySlug = req.query.storeSlug || req.query.store;
  const slug = (headerSlug || querySlug || '').toString().toLowerCase().trim();

  // If no store slug specified:
  if (!slug || slug === 'all') {
    req.store = null;
    req.storeSlug = null;
    req.storeId = null;
    return next();
  }

  // Check known stores from shared constants
  const knownStore = STORES.find(s => s.slug === slug || s.id === slug);

  if (isDbConnected()) {
    try {
      const storeDoc = await Store.findOne({ slug, active: true });
      if (storeDoc) {
        req.store = storeDoc;
        req.storeId = storeDoc._id;
        req.storeSlug = storeDoc.slug;
        return next();
      }
    } catch (e) {
      console.warn('[Tenant] DB lookup error:', e.message);
    }
  }

  if (knownStore) {
    req.store = knownStore;
    req.storeId = knownStore.id;
    req.storeSlug = knownStore.slug;
    return next();
  }

  // If a slug was explicitly provided but not found
  req.store = { slug, name: slug, currency: 'TND' };
  req.storeId = slug;
  req.storeSlug = slug;
  next();
};
