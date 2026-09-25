const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', index: true },
  storeSlug: { type: String, required: true, index: true },
  id: Number,
  title: { type: String, required: true },
  slug: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: String,
  imageUrl: String,
  author: { type: String, default: 'Équipe Expert' },
  category: String,
  tags: [String],
  readTime: { type: String, default: '5 min' },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models.BlogPost || mongoose.model('BlogPost', blogPostSchema);
