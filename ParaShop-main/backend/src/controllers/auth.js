
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const sendEmail = require('../utils/sendEmail');
const catchAsync = require('../utils/catchAsync');

// Configuration Sécurité
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || "votre_secret_jwt_tres_long_et_securise_123456";
const ACCESS_TOKEN_EXPIRE = '15m'; // Sécurité maximale : 15 minutes
const REFRESH_TOKEN_DAYS = 7;      // Confort : 7 jours avant reconnexion obligatoire
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// --- Helper Function for Token Generation ---
const generateTokensAndCookie = async (user, res) => {
    // 1. Générer l'Access Token (Court terme, pour les requêtes API)
    const accessToken = jwt.sign({ id: user._id, role: user.role }, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRE,
    });

    // 2. Générer le Refresh Token (Long terme, pour obtenir un nouvel Access Token)
    const refreshToken = uuidv4();
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + REFRESH_TOKEN_DAYS);
    
    // 3. Sauvegarder le Refresh Token en base (Rotation des tokens)
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = refreshTokenExpiry;
    user.derniere_connexion = new Date();
    await user.save({ validateBeforeSave: false });

    // 4. Envoyer le Refresh Token dans un cookie sécurisé (HTTPOnly)
    // Le frontend ne peut pas lire ce cookie, ce qui empêche le vol par XSS
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Invisible pour le JS côté client
      secure: process.env.NODE_ENV === 'production', // HTTPS uniquement en prod
      sameSite: 'lax', // Protection CSRF basique
      expires: refreshTokenExpiry,
      path: '/' // Valide pour tout le site (notamment /api/auth/refresh)
    });

    return accessToken;
}

exports.register = catchAsync(async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;

  if (password && !/^(?=.*[A-Za-z])(?=.*\d).{3,}$/.test(password)) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 3 caractères, avec des lettres et des chiffres." });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
      return res.status(409).json({ message: 'Un compte avec cet email existe déjà. Veuillez vous connecter.' });
  }

  const user = new User({ 
      firstName, lastName, email, password, phone,
      role: 'CUSTOMER',
      provider: 'local',
      isProfileComplete: true
  });

  await user.save();
  
  res.status(201).json({ 
      message: 'Inscription réussie ! Veuillez vous connecter.',
      user: { id: user._id.toString(), email: user.email }
  });
});

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe requis.' });

  const user = await User.findOne({ email }).select('+password');
  if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

  // Si c'est un compte OAuth qui tente de se connecter avec mot de passe
  if (user.provider !== 'local' && !user.password) {
      return res.status(403).json({ message: `Ce compte utilise ${user.provider}. Veuillez vous connecter via ce service.` });
  }

  if (!(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Mot de passe incorrect !' });
  }
  
  const accessToken = await generateTokensAndCookie(user, res);

  res.status(200).json({
    accessToken: accessToken,
    user: { 
        id: user._id.toString(), 
        firstName: user.firstName, 
        lastName: user.lastName, 
        email: user.email, 
        role: user.role 
    }
  });
});

exports.refreshToken = catchAsync(async (req, res) => {
    // Le refresh token DOIT venir du cookie httpOnly
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
        return res.status(401).json({ message: "Session expirée (Token manquant)." });
    }

    const user = await User.findOne({ refreshToken });
    
    // Si le token n'existe pas en base ou ne correspond plus (rotation invalide)
    if (!user) {
        // Nettoyage du cookie par sécurité
        res.clearCookie('refreshToken', { httpOnly: true, path: '/' });
        return res.status(403).json({ message: "Session invalide. Veuillez vous reconnecter." });
    }

    // Vérification date expiration
    if (user.refreshTokenExpiry < new Date()) {
        user.refreshToken = null;
        user.refreshTokenExpiry = null;
        await user.save({ validateBeforeSave: false });
        
        res.clearCookie('refreshToken', { httpOnly: true, path: '/' });
        return res.status(403).json({ message: "Session expirée. Veuillez vous reconnecter." });
    }

    // Tout est bon, on génère un nouveau couple Access/Refresh
    const newAccessToken = await generateTokensAndCookie(user, res);
    
    res.status(200).json({ 
        accessToken: newAccessToken,
        user: { id: user._id, role: user.role } // On renvoie l'user au cas où
    });
});

exports.logout = catchAsync(async (req, res) => {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
        await User.findOneAndUpdate({ refreshToken }, { $set: { refreshToken: null, refreshTokenExpiry: null } });
    }
    // Suppression propre du cookie
    res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
    res.status(200).json({ message: "Déconnexion réussie." });
});

exports.getMe = catchAsync(async (req, res) => {
    // req.user est peuplé par le middleware 'protect' via l'Access Token
    if (!req.user) return res.status(401).json({ message: "Non autorisé" });
    res.status(200).json({ 
        id: req.user._id.toString(),
        firstName: req.user.firstName, 
        lastName: req.user.lastName, 
        email: req.user.email, 
        phone: req.user.phone, 
        role: req.user.role, 
        addresses: req.user.addresses, 
        age: req.user.age,
        photo_profil: req.user.photo_profil
    });
});

exports.forgotPassword = catchAsync(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email, provider: 'local' });
    if (!user) return res.status(200).json({ success: true, message: "Si un compte existe, un email a été envoyé." });
    
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    
    const resetUrl = `${FRONTEND_URL}/#/reset-password?token=${resetToken}`;
    const message = `Réinitialisation : \n${resetUrl}`;
    
    try {
        await sendEmail({ email: user.email, subject: 'Réinitialisation mot de passe', message });
        res.status(200).json({ success: true, message: "Email envoyé." });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({ message: 'Erreur email' });
    }
});

exports.resetPassword = catchAsync(async (req, res) => {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: "Jeton invalide ou expiré." });
    
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    const accessToken = await generateTokensAndCookie(user, res);
    res.status(200).json({ message: "Mot de passe réinitialisé.", accessToken });
});

// --- OAUTH HANDLERS UNIFIÉS ---
const handleOAuthResponse = async (req, res, provider) => {
    try {
        let action = 'login';
        if (req.query.state) {
            try {
                const decodedState = Buffer.from(req.query.state, 'base64').toString('ascii');
                const stateData = JSON.parse(decodedState);
                action = stateData.action || 'login';
            } catch (e) { console.error("Error parsing OAuth state", e); }
        }

        const user = req.user;
        const isNewUser = req.authInfo && req.authInfo.isNew;

        if (action === 'register') {
            if (isNewUser) {
                return res.redirect(`${FRONTEND_URL}/#/?success=registered`);
            } else {
                return res.redirect(`${FRONTEND_URL}/#/?error=user_exists`);
            }
        }

        if (action === 'login') {
            // Important: On génère les tokens et on set le cookie AVANT la redirection
            const accessToken = await generateTokensAndCookie(user, res);
            return res.redirect(`${FRONTEND_URL}/#/auth/callback?accessToken=${accessToken}`);
        }

        res.redirect(`${FRONTEND_URL}/#/?error=unknown_action`);

    } catch (error) {
        console.error(`OAuth Handler Error:`, error);
        res.redirect(`${FRONTEND_URL}/#/?error=server_error`);
    }
};

exports.googleAuthHandler = (req, res) => handleOAuthResponse(req, res, 'google');
exports.facebookAuthHandler = (req, res) => handleOAuthResponse(req, res, 'facebook');
