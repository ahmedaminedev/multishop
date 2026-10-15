const mongoose = require('mongoose');

const BlogPostSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.Mixed },
  slug: { type: String },
  title: { type: String, required: true },
  excerpt: String,
  summary: String,
  content: String,
  image: String,
  imageUrl: String,
  author: { type: String, default: 'Équipe Rédactionnelle' },
  authorImageUrl: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: String,
  category: String,
  shop: { type: String, default: 'nutrition' },
  filialeKey: { type: String, default: 'nutrition' },
  featured: { type: Boolean, default: false }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('BlogPost', BlogPostSchema);
