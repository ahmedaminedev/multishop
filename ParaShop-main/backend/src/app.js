
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/orders');
const packRoutes = require('./routes/packs');
const categoryRoutes = require('./routes/categories');
const storeRoutes = require('./routes/stores');
const promotionRoutes = require('./routes/promotions');
const advertisementRoutes = require('./routes/advertisements');
const offersConfigRoutes = require('./routes/offersConfig');
const blogRoutes = require('./routes/blog');
const contactRoutes = require('./routes/contact');
const chatRoutes = require('./routes/chat');
const paymentRoutes = require('./routes/payment');
const reviewRoutes = require('./routes/reviews');
const brandRoutes = require('./routes/brands');
const errorHandler = require('./middleware/errorHandler'); // Import Handler

require('./config/passport')(passport);

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(cookieParser());
app.use(passport.initialize());

const corsOptions = {
    origin: (origin, callback) => {
        const isDevelopment = process.env.NODE_ENV !== 'production';
        if (!origin) return callback(null, true);
        if (isDevelopment) {
            return callback(null, true);
        } else {
            return callback(null, true); 
        }
    },
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/packs', packRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/offers-config', offersConfigRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/brands', brandRoutes);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../public')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.send('API is running in Development mode...');
    });
}

// Error Handling Middleware (Doit être en dernier)
app.use(errorHandler);

module.exports = app;
