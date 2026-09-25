
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

// CONFIGURATION DES URLS
// BACKEND_URL : Pour le callback OAuth (communication serveur à serveur)
// DOIT ETRE http://localhost:8080 pour correspondre à votre configuration Google Cloud
// Nous forçons ici le port 8080 par défaut si BACKEND_URL n'est pas défini dans le .env
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

module.exports = function(passport) {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            console.error("Erreur Deserialization:", err);
            done(err, null);
        }
    });

    // --- LOGIQUE UNIFIÉE "FIND OR CREATE" ---
    const findOrCreateUser = async (profile, provider, done) => {
        console.log(`\n=============================================================`);
        console.log(`[${provider.toUpperCase()}] DÉBUT PROCESSUS AUTHENTIFICATION`);
        
        try {
            // 1. Chercher par ID du provider (GoogleID / FacebookID)
            const providerIdField = `${provider}Id`; // ex: facebookId
            let user = await User.findOne({ [providerIdField]: profile.id });

            if (user) {
                console.log(`[${provider.toUpperCase()}] Utilisateur existant trouvé par ID.`);
                // isNew: false indique que l'utilisateur existait déjà
                return done(null, user, { isNew: false });
            }

            // 2. Gestion de l'email
            let email = null;
            if (profile.emails && profile.emails.length > 0) {
                email = profile.emails[0].value;
            }

            // 3. Fallback Email
            if (!email) {
                email = `${provider}-${profile.id}@placeholder.com`;
                console.log(`[${provider.toUpperCase()}] Email manquant, utilisation du fallback: ${email}`);
            }

            // Vérifier si un compte existe déjà avec cet email pour le lier
            if (!email.includes('@placeholder.com')) {
                user = await User.findOne({ email: email });
                if (user) {
                    console.log(`[${provider.toUpperCase()}] Compte existant trouvé par email. Liaison...`);
                    user[providerIdField] = profile.id;
                    if (!user.provider || user.provider === 'local') {
                        user.provider = provider;
                    }
                    await user.save({ validateBeforeSave: false });
                    // isNew: false car le compte existait
                    return done(null, user, { isNew: false });
                }
            }

            // 4. Création d'un nouvel utilisateur
            console.log(`[${provider.toUpperCase()}] Création d'un NOUVEL utilisateur...`);

            let firstName = 'Client';
            let lastName = 'Nouveau';

            if (profile.name) {
                firstName = profile.name.givenName || firstName;
                lastName = profile.name.familyName || lastName;
            } else if (profile.displayName) {
                const parts = profile.displayName.split(' ');
                firstName = parts[0];
                if (parts.length > 1) {
                    lastName = parts.slice(1).join(' ');
                }
            }

            const newUserInfo = {
                [providerIdField]: profile.id,
                email: email,
                firstName: firstName,
                lastName: lastName,
                role: 'CUSTOMER',
                provider: provider,
                status_validation: 'validé',
                isProfileComplete: true,
                phone: '00000000',
                photo_profil: (profile.photos && profile.photos.length > 0) ? profile.photos[0].value : undefined
            };

            const newUser = new User(newUserInfo);
            await newUser.save({ validateBeforeSave: false });
            
            // isNew: true indique que c'est une nouvelle inscription
            return done(null, newUser, { isNew: true });

        } catch (err) {
            console.error(`ERROR AUTH ${provider.toUpperCase()}:`, err);
            return done(err, null);
        }
    };

    // --- GOOGLE ---
    const googleCallback = `${BACKEND_URL}/api/auth/google/callback`;
    
    console.log("--------------------------------------------------");
    console.log("[GOOGLE AUTH CONFIG]");
    console.log(`Callback URL Configurée: ${googleCallback}`);
    console.log("Vérifiez que cette URL est EXACTEMENT celle dans 'Authorized redirect URIs' sur Google Cloud Console.");
    console.log("--------------------------------------------------");
    
    passport.use(new GoogleStrategy({
      
clientID: process.env.GOOGLE_CLIENT_ID,
clientSecret: process.env.GOOGLE_CLIENT_SECRET,       
 callbackURL: googleCallback,
        passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
        await findOrCreateUser(profile, 'google', done);
    }));

    // --- FACEBOOK ---
    const facebookCallback = `${BACKEND_URL}/api/auth/facebook/callback`;
    // console.log(`[FACEBOOK CONFIG] Callback URL: ${facebookCallback}`);

    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID || "1125464563112537",
        clientSecret: process.env.FACEBOOK_APP_SECRET || "e9cd0f5243886a9badc6e81eee57449f",
        callbackURL: facebookCallback,
        profileFields: ['id', 'emails', 'name', 'photos', 'displayName'],
        passReqToCallback: true,
        enableProof: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
        await findOrCreateUser(profile, 'facebook', done);
    }));
};
