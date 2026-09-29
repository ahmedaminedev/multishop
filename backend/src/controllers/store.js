
const Store = require('../models/Store');
const catchAsync = require('../utils/catchAsync');

exports.getStores = catchAsync(async (req, res) => {
  const stores = await Store.find({});
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
