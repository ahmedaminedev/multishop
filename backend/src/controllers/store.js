
const Store = require('../models/Store');
const catchAsync = require('../utils/catchAsync');
const initialData = require('../data/initialData');
const mongoose = require('mongoose');

exports.getStores = catchAsync(async (req, res) => {
  const shop = req.query.shop || req.headers['x-shop-id'];
  let stores = [];
  if (mongoose.connection.readyState === 1) {
    let filter = {};
    if (shop && shop !== 'all') {
      filter = { $or: [{ shop }, { filialeKey: shop }] };
    }
    stores = await Store.find(filter).lean().catch(() => []);
  }
  if (!stores || stores.length === 0) {
    stores = (initialData.stores || []).filter(s => {
      if (!shop || shop === 'all') return true;
      return s.shop === shop || s.filialeKey === shop;
    });
  }
  res.json(stores);
});

exports.createStore = catchAsync(async (req, res) => {
  const store = await Store.create(req.body);
  res.status(201).json(store);
});

exports.updateStore = catchAsync(async (req, res) => {
  const store = await Store.findOne({ id: req.params.id });
  if (store) {
    Object.assign(store, req.body);
    const updatedStore = await store.save();
    res.json(updatedStore);
  } else {
    res.status(404).json({ message: 'Magasin non trouvé' });
  }
});

exports.deleteStore = catchAsync(async (req, res) => {
  const store = await Store.findOneAndDelete({ id: req.params.id });
  if (store) {
    res.json({ message: 'Magasin supprimé' });
  } else {
    res.status(404).json({ message: 'Magasin non trouvé' });
  }
});
