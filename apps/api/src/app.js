const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const tenantMiddleware = require('./middlewares/tenant');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const packRoutes = require('./routes/packs');
const orderRoutes = require('./routes/orders');
const storeRoutes = require('./routes/stores');
const adminRoutes = require('./routes/admin');
const promotionRoutes = require('./routes/promotions');
const advertisementRoutes = require('./routes/advertisements');
const offersConfigRoutes = require('./routes/offersConfig');
const blogRoutes = require('./routes/blog');
const brandRoutes = require('./routes/brands');
const contactRoutes = require('./routes/contact');
const reviewRoutes = require('./routes/reviews');
const chatRoutes = require('./routes/chat');
const paymentRoutes = require('./routes/payment');

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS']
}));

// Multi-tenant middleware applied to all /api routes
app.use('/api', tenantMiddleware);

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/packs', packRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/offers-config', offersConfigRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payment', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    time: new Date().toISOString(),
    stores: ['parashop', 'nutritionshop', 'cosmeticshop', 'electroshop']
  });
});

// Graceful error handler
app.use((err, req, res, next) => {
  console.error('[API Error]', err);
  if (err.name === 'MongooseError' || err.name === 'MongoNetworkError' || (err.message && err.message.includes('buffering timed out'))) {
    if (req.method === 'GET') {
      return res.json(req.path.endsWith('s') || req.path.endsWith('s/') ? [] : {});
    }
    return res.status(503).json({ error: 'Service temporairement indisponible (base hors-ligne)' });
  }
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Une erreur serveur est survenue'
  });
});

module.exports = app;
