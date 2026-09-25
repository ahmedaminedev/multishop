
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport'); // Import Passport

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/orders');
const packRoutes = require('./routes/packs');
const categoryRoutes = require('./routes/categories');
const storeRoutes = require('./routes/stores');
const promotionRoutes = require('./routes/promotions');
const advertisementRoutes = require('./routes/advertisements');
const blogRoutes = require('./routes/blog');
const contactRoutes = require('./routes/contact');
const chatRoutes = require('./routes/chat');
const paymentRoutes = require('./routes/payment'); // Ajout

// Config Passport
require('./config/passport')(passport);

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(passport.initialize()); // Init Passport Middleware

// Configuration des middlewares
const corsOptions = {
    origin: (origin, callback) => {
        const isDevelopment = process.env.NODE_ENV !== 'production';
        if (!origin) return callback(null, true);
        if (isDevelopment) {
            return callback(null, true);
        } else {
            // En production, autoriser le frontend (qui est servi par la même origine)
            // ou l'URL Azure spécifique si nécessaire
            return callback(null, true); 
        }
    },
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/packs', packRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payment', paymentRoutes);

// --- SERVING FRONTEND IN PRODUCTION ---
if (process.env.NODE_ENV === 'production') {
    // Servir les fichiers statiques du dossier build/dist
    // On suppose que le dossier 'dist' du frontend sera copié dans 'backend/public' lors du déploiement
    app.use(express.static(path.join(__dirname, '../public')));

    // Pour toute autre route (non API), renvoyer l'index.html du frontend
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.send('API is running in Development mode...');
    });
}

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: (process.env.NODE_ENV || 'development') === 'production' ? null : err.stack,
  });
});

module.exports = app;
