
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const sendEmail = require('../utils/sendEmail');
const catchAsync = require('../utils/catchAsync');

// Configuration
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || "votre_secret_jwt_tres_long_et_securise_123456";
const ACCESS_TOKEN_EXPIRE = '15m'; 
const REFRESH_TOKEN_DAYS = 7;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// --- Helper Function for Login ---
const loginUser = async (user, res) => {
    // Générer l'accessToken (JWT)
    const accessToken = jwt.sign({ id: user._id }, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRE,
    });

    // Générer le refreshToken (UUID)
    const refreshToken = uuidv4();
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + REFRESH_TOKEN_DAYS);
    
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = refreshTokenExpiry;
    user.derniere_connexion = new Date();
    await user.save({ validateBeforeSave: false });

    // Envoyer le refreshToken dans un cookie httpOnly
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: (process.env.NODE_ENV || 'development') === 'production',
      sameSite: 'lax',
      expires: refreshTokenExpiry,
      path: '/'
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
  
  // MODIFICATION : On ne connecte PAS automatiquement l'utilisateur (pas de loginUser).
  // On renvoie juste un succès pour que le front redirige vers le login.
  res.status(201).json({ 
      message: 'Inscription réussie ! Veuillez vous connecter.',
      user: { id: user._id, email: user.email }
  });
});

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe requis.' });

  const user = await User.findOne({ email }).select('+password');
  if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

  // Si c'est un compte OAuth qui tente de se connecter avec mot de passe (sauf s'il en a défini un plus tard)
  if (user.provider !== 'local' && !user.password) {
      return res.status(403).json({ message: `Ce compte utilise ${user.provider}. Veuillez vous connecter via ce service.` });
  }

  if (!(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Mot de passe incorrect !' });
  }
  
  const accessToken = await loginUser(user, res);

  res.status(200).json({
    accessToken: accessToken,
    user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }
  });
});

exports.refreshToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json({ message: "Refresh token manquant." });

    const user = await User.findOne({ refreshToken });
    if (!user) return res.status(403).json({ message: "Refresh token invalide." });

    if (user.refreshTokenExpiry < new Date()) {
        user.refreshToken = null;
        user.refreshTokenExpiry = null;
        await user.save({ validateBeforeSave: false });
        res.clearCookie('refreshToken', { httpOnly: true, secure: (process.env.NODE_ENV || 'development') === 'production', sameSite: 'lax', path: '/' });
        return res.status(403).json({ message: "Session expirée. Veuillez vous reconnecter." });
    }

    const newAccessToken = await loginUser(user, res);
    res.status(200).json({ accessToken: newAccessToken });
});

exports.logout = catchAsync(async (req, res) => {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
        await User.findOneAndUpdate({ refreshToken }, { $set: { refreshToken: null, refreshTokenExpiry: null } });
    }
    res.clearCookie('refreshToken', { httpOnly: true, secure: (process.env.NODE_ENV || 'development') === 'production', sameSite: 'lax', path: '/' });
    res.status(200).json({ message: "Déconnexion réussie." });
});

exports.getMe = catchAsync(async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Non autorisé" });
    res.status(200).json({ 
        id: req.user._id, firstName: req.user.firstName, lastName: req.user.lastName, email: req.user.email, phone: req.user.phone, role: req.user.role, addresses: req.user.addresses, age: req.user.age 
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
    const accessToken = await loginUser(user, res);
    res.status(200).json({ message: "Mot de passe réinitialisé.", accessToken });
});

// --- OAUTH HANDLERS UNIFIÉS ET STRICTS ---

const handleOAuthResponse = async (req, res, provider) => {
    try {
        // 1. Décoder le paramètre state pour connaître l'action (login ou register)
        let action = 'login';
        if (req.query.state) {
            try {
                const decodedState = Buffer.from(req.query.state, 'base64').toString('ascii');
                const stateData = JSON.parse(decodedState);
                action = stateData.action || 'login';
            } catch (e) {
                console.error("Erreur parsing state OAuth:", e);
            }
        }

        const user = req.user;
        const isNewUser = req.authInfo && req.authInfo.isNew;

        console.log(`OAuth Handler [${provider}]: Action=${action}, NewUser=${isNewUser}, UserID=${user._id}`);

        // CAS 1: INSCRIPTION (Register)
        // L'utilisateur veut créer un compte.
        if (action === 'register') {
            if (isNewUser) {
                // Succès : C'est bien un nouvel utilisateur.
                // REGLE : On ne génère PAS de token. On redirige vers Login avec message succès.
                // Le front détectera ?success=registered
                return res.redirect(`${FRONTEND_URL}/#/?success=registered`);
            } else {
                // Erreur : L'utilisateur existe déjà.
                // Le front détectera ?error=user_exists
                return res.redirect(`${FRONTEND_URL}/#/?error=user_exists`);
            }
        }

        // CAS 2: CONNEXION (Login)
        // L'utilisateur veut se connecter.
        if (action === 'login') {
            // Note: Si l'utilisateur n'existait pas, il a été créé par findOrCreateUser (comportement standard "Sign in with Google").
            // Si vous vouliez interdire strictement la création lors du login, il faudrait modifier Passport pour échouer si l'user n'existe pas.
            // Ici, on suit la convention standard : Login = Connexion réussie (même si compte créé à la volée).
            
            // Génération des tokens
            const accessToken = await loginUser(user, res);
            
            // Redirection vers l'app avec le token
            return res.redirect(`${FRONTEND_URL}/#/auth/callback?accessToken=${accessToken}`);
        }

        // Fallback
        res.redirect(`${FRONTEND_URL}/#/?error=unknown_action`);

    } catch (error) {
        console.error(`OAuth Handler Error:`, error);
        res.redirect(`${FRONTEND_URL}/#/?error=server_error`);
    }
};

exports.googleAuthHandler = (req, res) => handleOAuthResponse(req, res, 'google');
exports.facebookAuthHandler = (req, res) => handleOAuthResponse(req, res, 'facebook');
