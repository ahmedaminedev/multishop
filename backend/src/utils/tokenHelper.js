const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || "votre_secret_jwt_tres_long_et_securise_123456";
const ACCESS_TOKEN_EXPIRE = '15m'; // 15 minutes
const REFRESH_TOKEN_DAYS = 7;      // 7 jours

// Session store en mémoire (garantit zéro déconnexion même en cas de latence ou reconnexion MongoDB)
const sessionStore = new Map();
const revokedTokens = new Set();

/**
 * Génère le couple Access Token + Refresh Token, persiste en BDD et mémoire, et envoie les cookies HTTPOnly
 */
const generateTokensAndCookie = async (user, res) => {
  const userId = String(user._id || user.id || 'usr-1');
  const userRole = user.role || 'CUSTOMER';
  const userEmail = user.email || 'client@multishop.com';
  const userFirstName = user.firstName || (userRole === 'ADMIN' ? 'Super' : 'Client');
  const userLastName = user.lastName || (userRole === 'ADMIN' ? 'Admin' : 'MultiShop');

  // 1. Access Token (15 minutes)
  const accessToken = jwt.sign(
    { id: userId, role: userRole, email: userEmail },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRE }
  );
  const accessTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

  // 2. Refresh Token (7 jours)
  const refreshToken = uuidv4();
  const refreshTokenExpiry = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

  // 3. Sauvegarder dans l'objet user en mémoire
  user.accessToken = accessToken;
  user.accessTokenExpiry = accessTokenExpiry;
  user.refreshToken = refreshToken;
  user.refreshTokenExpiry = refreshTokenExpiry;
  user.derniere_connexion = new Date();

  const sessionData = {
    id: userId,
    _id: userId,
    email: userEmail,
    role: userRole,
    firstName: userFirstName,
    lastName: userLastName,
    phone: user.phone || '+216 71 000 000',
    accessToken,
    accessTokenExpiry,
    refreshToken,
    refreshTokenExpiry,
    derniere_connexion: user.derniere_connexion
  };

  // Enregistrement immédiat dans le cache session mémoire
  sessionStore.set(refreshToken, sessionData);
  sessionStore.set(accessToken, sessionData);
  sessionStore.set(userId, sessionData);

  // 4. Sauvegarde persistante en base de données MongoDB
  const mongoose = require('mongoose');
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      const User = require('../models/User');
      if (mongoose.Types.ObjectId.isValid(userId)) {
        await User.findByIdAndUpdate(userId, {
          $set: {
            accessToken,
            accessTokenExpiry,
            refreshToken,
            refreshTokenExpiry,
            derniere_connexion: user.derniere_connexion
          }
        });
      } else {
        await User.findOneAndUpdate(
          { email: userEmail },
          {
            $set: {
              accessToken,
              accessTokenExpiry,
              refreshToken,
              refreshTokenExpiry,
              derniere_connexion: user.derniere_connexion
            }
          }
        );
      }
    } catch (err) {
      console.warn('[AUTH] Notice persisting tokens to MongoDB:', err.message);
    }
  }

  // 5. Envoyer les DEUX tokens dans des cookies sécurisés HTTPOnly
  // Conforme aux directives de sécurité AI Studio en environnement iframe (cross-origin) :
  // SameSite='none' et secure=true sont OBLIGATOIRES pour que le navigateur n'ignore pas les cookies.
  if (res && typeof res.cookie === 'function') {
    const cookieBaseOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/'
    };

    res.cookie('accessToken', accessToken, {
      ...cookieBaseOptions,
      expires: accessTokenExpiry
    });

    res.cookie('refreshToken', refreshToken, {
      ...cookieBaseOptions,
      expires: refreshTokenExpiry
    });
  }

  return {
    accessToken,
    accessTokenExpiry,
    refreshToken,
    refreshTokenExpiry
  };
};

/**
 * Recherche une session valide à partir du refreshToken (mémoire ou BDD)
 */
const findUserByRefreshToken = async (refreshToken) => {
  if (!refreshToken || revokedTokens.has(refreshToken)) return null;

  // 1. Recherche dans le cache session mémoire
  if (sessionStore.has(refreshToken)) {
    const cached = sessionStore.get(refreshToken);
    if (cached && (!cached.refreshTokenExpiry || new Date(cached.refreshTokenExpiry) > new Date())) {
      return cached;
    }
  }

  // 2. Recherche en base MongoDB
  const mongoose = require('mongoose');
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      const User = require('../models/User');
      const user = await User.findOne({ refreshToken });
      if (user && user.refreshTokenExpiry && user.refreshTokenExpiry > new Date()) {
        const mapped = {
          id: user._id.toString(),
          _id: user._id.toString(),
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          accessToken: user.accessToken,
          accessTokenExpiry: user.accessTokenExpiry,
          refreshToken: user.refreshToken,
          refreshTokenExpiry: user.refreshTokenExpiry
        };
        sessionStore.set(refreshToken, mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('[AUTH] Error finding user by refreshToken in DB:', e.message);
    }
  }

  return null;
};

/**
 * Recherche une session par accessToken ou identifiant
 */
const findUserByAccessToken = async (accessToken) => {
  if (!accessToken || revokedTokens.has(accessToken)) return null;

  if (sessionStore.has(accessToken)) {
    return sessionStore.get(accessToken);
  }

  try {
    const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
    if (decoded && decoded.id) {
      if (revokedTokens.has(decoded.id)) return null;
      if (sessionStore.has(decoded.id)) {
        return sessionStore.get(decoded.id);
      }
      return {
        id: decoded.id,
        _id: decoded.id,
        role: decoded.role || 'CUSTOMER',
        email: decoded.email || (decoded.role === 'ADMIN' ? 'admin@multishop.com' : 'client@multishop.com'),
        firstName: decoded.role === 'ADMIN' ? 'Super' : 'Client',
        lastName: decoded.role === 'ADMIN' ? 'Admin' : 'MultiShop'
      };
    }
  } catch {}

  return null;
};

/**
 * Supprime une session (déconnexion)
 */
const removeSession = async (refreshToken, accessToken) => {
  if (refreshToken) {
    const session = sessionStore.get(refreshToken);
    if (session && session.id) {
      sessionStore.delete(session.id);
      if (session.accessToken) {
        revokedTokens.add(session.accessToken);
        sessionStore.delete(session.accessToken);
      }
    }
    sessionStore.delete(refreshToken);
    revokedTokens.add(refreshToken);
  }
  if (accessToken) {
    const session = sessionStore.get(accessToken);
    if (session && session.id) {
      sessionStore.delete(session.id);
      if (session.refreshToken) {
        revokedTokens.add(session.refreshToken);
        sessionStore.delete(session.refreshToken);
      }
    }
    sessionStore.delete(accessToken);
    revokedTokens.add(accessToken);
  }

  const mongoose = require('mongoose');
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      const User = require('../models/User');
      await User.findOneAndUpdate(
        { $or: [{ refreshToken }, { accessToken }] },
        {
          $set: {
            refreshToken: null,
            refreshTokenExpiry: null,
            accessToken: null,
            accessTokenExpiry: null
          }
        }
      );
    } catch {}
  }
};

/**
 * Supprime proprement les cookies HTTPOnly d'authentification
 */
const clearAuthCookies = (res) => {
  if (res && typeof res.clearCookie === 'function') {
    const clearOpts = {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/'
    };
    res.clearCookie('accessToken', clearOpts);
    res.clearCookie('refreshToken', clearOpts);
  }
};

module.exports = {
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRE,
  REFRESH_TOKEN_DAYS,
  generateTokensAndCookie,
  findUserByRefreshToken,
  findUserByAccessToken,
  removeSession,
  clearAuthCookies,
  sessionStore
};
