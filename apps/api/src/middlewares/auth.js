const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { isDbConnected } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'multishop_super_secret_jwt_key_2026';

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ message: 'Non autorisé, aucun jeton fourni.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (isDbConnected()) {
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
        return next();
      }
    }
    // Fallback user from token payload
    req.user = {
      id: decoded.id || 'admin_user_id',
      _id: decoded.id || 'admin_user_id',
      name: decoded.name || 'Admin Multishop',
      email: decoded.email || 'admin@multishop.tn',
      role: decoded.role || 'SUPER_ADMIN',
      storeSlug: decoded.storeSlug || null
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Non autorisé, jeton invalide ou expiré.' });
  }
};

module.exports = { protect };
