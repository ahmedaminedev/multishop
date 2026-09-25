
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || "votre_secret_jwt_tres_long_et_securise_123456";

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // On privilégie le Bearer Token dans le header Authorization pour l'Access Token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Optionnel : Support cookie si vous décidez de stocker l'access token en cookie aussi (mais ici on utilise localStorage pour l'access)
  // else if (req.cookies.accessToken) { token = req.cookies.accessToken; }

  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ message: 'Non autorisé, token manquant.' });
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
        console.error(`[AUTH ERROR] User not found for ID from token: ${decoded.id}`);
        return res.status(401).json({ message: 'Utilisateur non trouvé.' });
    }

    next();
  } catch (error) {
    console.error(`[AUTH ERROR] Token verification failed: ${error.message}`);
    // Si le token est expiré, le client recevra 401 et déclenchera la logique de refresh via api.ts
    return res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
});

exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé : réservé aux administrateurs.' });
  }
};
