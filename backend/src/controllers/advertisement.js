
const Advertisement = require('../models/Advertisement');
const catchAsync = require('../utils/catchAsync');
const { initialAdvertisements } = require('../data/initialData');

exports.getAdvertisements = catchAsync(async (req, res) => {
  let ads = await Advertisement.findOne({});
  
  // If no ads config exists in DB, create one from initialData
  if (!ads) {
      console.log('Initializing Advertisements from seed data...');
      ads = await Advertisement.create(initialAdvertisements);
  }
  
  res.json(ads);
});

exports.updateAdvertisements = catchAsync(async (req, res) => {
  let ads = await Advertisement.findOne({});
  if (ads) {
    // We update the existing document
    // Using replaceOne or strict update is risky with Mongoose if schemas are loose
    // Object.assign works well for top-level keys
    Object.assign(ads, req.body);
    // Mark modified for mixed types if necessary, but top level assignment usually triggers save
    const updatedAds = await ads.save();
    res.json(updatedAds);
  } else {
    // Should not happen if get runs first, but safety check
    ads = await Advertisement.create(req.body);
    res.json(ads);
  }
});
