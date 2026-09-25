const express = require('express');
const router = express.Router();

const mockReviews = [
  { id: 1, productId: 1, userName: 'Yassine M.', rating: 5, comment: 'Excellent produit, qualité irréprochable et livraison rapide !', verifiedPurchase: true, date: '2026-02-15' },
  { id: 2, productId: 1, userName: 'Amira K.', rating: 4, comment: 'Très satisfaite de mon achat, je recommande.', verifiedPurchase: true, date: '2026-03-01' },
  { id: 3, productId: 2, userName: 'Sami B.', rating: 5, comment: 'Parfait, conforme à la description.', verifiedPurchase: true, date: '2026-03-10' }
];

router.get('/:productId', (req, res) => {
  const pId = Number(req.params.productId);
  const filtered = mockReviews.filter(r => r.productId === pId);
  res.json(filtered.length > 0 ? filtered : mockReviews.slice(0, 2));
});

router.post('/', (req, res) => {
  const newRev = {
    id: Date.now(),
    productId: Number(req.body.productId),
    userName: req.body.userName || 'Client',
    rating: req.body.rating || 5,
    comment: req.body.comment || '',
    verifiedPurchase: true,
    date: new Date().toISOString()
  };
  mockReviews.unshift(newRev);
  res.status(201).json(newRev);
});

module.exports = router;
