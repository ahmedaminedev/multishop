const express = require('express');
const router = express.Router();

let offersConfig = {
  headerOffer: { text: "Livraison gratuite dès 100 TND d'achat", active: true },
  flashSale: { active: true, discount: 20, endsAt: new Date(Date.now() + 86400000).toISOString() }
};

router.get('/', (req, res) => {
  res.json(offersConfig);
});

router.put('/', (req, res) => {
  offersConfig = { ...offersConfig, ...req.body };
  res.json(offersConfig);
});

module.exports = router;
