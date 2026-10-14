
const Pack = require('../models/Pack');
const catchAsync = require('../utils/catchAsync');
const initialData = require('../data/initialData');
const mongoose = require('mongoose');

exports.getPacks = catchAsync(async (req, res) => {
  const shop = req.query.shop || req.headers['x-shop-id'];
  let packs = [];
  if (mongoose.connection.readyState === 1) {
    let filter = {};
    if (shop && shop !== 'all') {
      filter = { $or: [{ shop }, { filialeKey: shop }] };
    }
    packs = await Pack.find(filter).lean().catch(() => []);
  }
  if (!packs || packs.length === 0) {
    packs = (initialData.packs || []).filter(p => {
      if (!shop || shop === 'all') return true;
      return p.shop === shop || p.filialeKey === shop;
    });
  }
  res.json(packs);
});

exports.createPack = catchAsync(async (req, res) => {
  const pack = await Pack.create(req.body);
  res.status(201).json(pack);
});

exports.updatePack = catchAsync(async (req, res) => {
  const pack = await Pack.findOne({ id: req.params.id });
  if (pack) {
    Object.assign(pack, req.body);
    const updatedPack = await pack.save();
    res.json(updatedPack);
  } else {
    res.status(404).json({ message: 'Pack non trouvé' });
  }
});

exports.deletePack = catchAsync(async (req, res) => {
  const pack = await Pack.findOneAndDelete({ id: req.params.id });
  if (pack) {
    res.json({ message: 'Pack supprimé' });
  } else {
    res.status(404).json({ message: 'Pack non trouvé' });
  }
});
