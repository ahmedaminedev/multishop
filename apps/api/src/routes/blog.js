const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');

// GET /api/blog
router.get('/', (req, res) => {
  const storeSlug = req.storeSlug || req.query.storeSlug || null;
  res.json(dataStore.getBlogPosts(storeSlug));
});

// GET /api/blog/:slug
router.get('/:slug', (req, res) => {
  const storeSlug = req.storeSlug || req.query.storeSlug || null;
  const post = dataStore.getBlogPostBySlug(req.params.slug, storeSlug);
  if (!post) return res.status(404).json({ message: 'Article introuvable' });
  res.json(post);
});

module.exports = router;
