
const express = require('express');
const router = express.Router();
const passport = require('passport');
const { register, login, logout, getMe, forgotPassword, resetPassword, refreshToken, googleAuthHandler, facebookAuthHandler } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Auth Classique
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);

// Mot de passe oublié
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// --- GOOGLE OAUTH ---
router.get('/google', (req, res, next) => {
    const { action, role } = req.query;
    // On encode l'état pour savoir si c'est un login ou un register
    const stateObj = { action: action || 'login', role: role || 'client' };
    const state = Buffer.from(JSON.stringify(stateObj)).toString('base64');
    
    passport.authenticate('google', { 
        scope: ['profile', 'email'], 
        state: state,
        session: false 
    })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
        if (err) {
            console.error("Google Auth Error:", err);
            return res.redirect(`${FRONTEND_URL}/#/?error=server_error`);
        }
        if (!user) {
            const message = info ? info.message : 'auth_failed';
            return res.redirect(`${FRONTEND_URL}/#/login?error=${message}`);
        }
        // On passe user et info (qui contient isNew) au contrôleur
        req.user = user;
        req.authInfo = info; 
        googleAuthHandler(req, res);
    })(req, res, next);
});

// --- FACEBOOK OAUTH ---
router.get('/facebook', (req, res, next) => {
    const { action, role } = req.query;
    const stateObj = { action: action || 'login', role: role || 'client' };
    const state = Buffer.from(JSON.stringify(stateObj)).toString('base64');

    passport.authenticate('facebook', { 
        scope: ['email', 'public_profile'], 
        state: state,
        session: false 
    })(req, res, next);
});

router.get('/facebook/callback', (req, res, next) => {
    passport.authenticate('facebook', { session: false }, (err, user, info) => {
        if (err) {
            console.error("Facebook Auth Error:", err);
            return res.redirect(`${FRONTEND_URL}/#/?error=server_error&details=${encodeURIComponent(err.message)}`);
        }
        if (!user) {
            const message = info ? info.message : 'auth_failed';
            return res.redirect(`${FRONTEND_URL}/#/login?error=${message}`);
        }
        req.user = user;
        req.authInfo = info;
        facebookAuthHandler(req, res);
    })(req, res, next);
});

module.exports = router;
