
const BlogPost = require('../models/BlogPost');
const catchAsync = require('../utils/catchAsync');

exports.getBlogPosts = catchAsync(async (req, res) => {
  // Récupère les données depuis la collection 'blogposts' de MongoDB
  const posts = await BlogPost.find({});
  res.json(posts);
});

exports.getBlogPostBySlug = catchAsync(async (req, res) => {
  // Récupère un article spécifique depuis la BDD
  const post = await BlogPost.findOne({ slug: req.params.slug });
  if (post) {
    res.json(post);
  } else {
    res.status(404).json({ message: 'Article non trouvé' });
  }
});

exports.createBlogPost = catchAsync(async (req, res) => {
  const post = await BlogPost.create(req.body);
  res.status(201).json(post);
});
