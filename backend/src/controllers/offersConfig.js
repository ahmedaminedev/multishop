
const OffersConfig = require('../models/OffersConfig');
const catchAsync = require('../utils/catchAsync');

exports.getOffersConfig = catchAsync(async (req, res) => {
  let config = await OffersConfig.findOne({});
  if (!config) {
    // Create default if not exists
    config = await OffersConfig.create({});
  }
  res.json(config);
});

exports.updateOffersConfig = catchAsync(async (req, res) => {
  let config = await OffersConfig.findOne({});
  if (config) {
    Object.assign(config, req.body);
    const updatedConfig = await config.save();
    res.json(updatedConfig);
  } else {
    config = await OffersConfig.create(req.body);
    res.json(config);
  }
});
