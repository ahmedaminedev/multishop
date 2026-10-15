const mongoose = require('mongoose');

const BlogPostSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  slug: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  excerpt: String,
  content: String,
  imageUrl: String,
  author: String,
  authorImageUrl: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: String,
  category: String,
  shop: { type: String, default: 'nutrition' },
  filialeKey: { type: String, default: 'nutrition' },
  featured: { type: Boolean, default: false }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('BlogPost', BlogPostSchema);
