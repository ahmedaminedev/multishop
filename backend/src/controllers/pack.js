
const Pack = require('../models/Pack');
const catchAsync = require('../utils/catchAsync');

exports.getPacks = catchAsync(async (req, res) => {
  const packs = await Pack.find({});
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
