
const Advertisement = require('../models/Advertisement');
const catchAsync = require('../utils/catchAsync');

exports.getAdvertisements = catchAsync(async (req, res) => {
  const ads = await Advertisement.findOne({});
  res.json(ads || {});
});

exports.updateAdvertisements = catchAsync(async (req, res) => {
  let ads = await Advertisement.findOne({});
  if (ads) {
    Object.assign(ads, req.body);
    const updatedAds = await ads.save();
    res.json(updatedAds);
  } else {
    ads = await Advertisement.create(req.body);
    res.json(ads);
  }
});
