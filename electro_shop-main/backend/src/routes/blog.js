
const express = require('express');
const router = express.Router();
const { getBlogPosts, getBlogPostBySlug, createBlogPost } = require('../controllers/blog');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .get(getBlogPosts)
  .post(protect, admin, createBlogPost);

router.route('/:slug')
  .get(getBlogPostBySlug);

module.exports = router;
