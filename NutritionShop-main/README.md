
# ⚡ IronFuel Nutrition - Plateforme E-commerce Performance

**IronFuel** est une solution e-commerce "Full Stack" ultra-moderne dédiée à la nutrition sportive, la musculation et le bien-être athlétique. Conçue avec une esthétique industrielle "Dark Mode", elle offre une expérience utilisateur immersive et agressive, optimisée pour la conversion et la fidélisation des sportifs.

![Version](https://img.shields.io/badge/version-2.0.0-neon.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Stack](https://img.shields.io/badge/stack-MERN-blue.svg)

## 🏋️‍♂️ Fonctionnalités Clés

### Pour les Athlètes (Front-Office)
*   **Design Industriel & Immersif :** Interface "Carbon & Neon" (#ccff00), typographie forte (Oswald/Inter) et animations fluides pour une ambiance "Gym".
*   **Sélecteur d'Objectif (IA) :** Module interactif remplaçant le "Virtual Try-On", guidant l'utilisateur vers les produits adaptés (Prise de masse, Sèche, Endurance) via une interface visuelle.
*   **Catalogue Performance :** Navigation optimisée par catégories (Protéines, Créatine, Accessoires) et marques partenaires.
*   **Packs Elite :** Système de vente groupée (Bundles) pour augmenter le panier moyen (ex: Pack Prise de Masse).
*   **Offres Flash & Comptes à Rebours :** Sections promotionnelles agressives avec timers pour créer l'urgence.
*   **Comparateur Technique :** Outil de comparaison des valeurs nutritionnelles et ingrédients côte à côte.
*   **Tracking de Commande Visuel :** Suivi de commande étape par étape avec timeline verticale.
*   **Support Live "QG" :** Chat en temps réel avec les coachs/support et intégration WhatsApp.

### Pour le QG (Back-Office / Admin)
*   **Command Center (Dashboard) :** Vue d'ensemble stratégique des KPIs avec un "Mode Analyse" pour des insights contextuels.
*   **Live Ops (Chat) :** Interface de messagerie temps réel pour interagir avec les visiteurs connectés (Socket.io).
*   **Gestion de l'Armurerie (Produits) :** CRUD complet des produits, gestion des stocks, variantes (goûts/tailles) et spécifications techniques.
*   **CMS Marketing Interactif :** Éditeur visuel pour modifier la Home Page (Bannières, Textes, Sélections) sans toucher au code.
*   **Gestion Logistique :** Suivi des commandes, changement de statuts et génération de factures PDF.
*   **Gestion des Bases (Magasins) :** Configuration des points de vente physiques et horaires d'ouverture.

## 🛠 Stack Technique

### Frontend
*   **React 18** : Architecture performante basée sur les composants fonctionnels et Hooks.
*   **TypeScript** : Typage statique pour une robustesse industrielle.
*   **Vite** : Build tool ultra-rapide.
*   **Tailwind CSS** : Styling utilitaire avec configuration personnalisée (Couleurs Neon, Polices, Animations).
*   **Framer Motion / Animations CSS** : Pour les transitions fluides et l'effet "skew" (incliné).
*   **Recharts** : Visualisation de données pour le dashboard admin.

### Backend
*   **Node.js & Express** : Serveur API RESTful robuste.
*   **MongoDB & Mongoose** : Base de données NoSQL flexible pour les catalogues produits complexes.
*   **Socket.io** : Communication WebSocket bidirectionnelle pour le Chat et les statuts Admin.
*   **JWT & Passport.js** : Authentification sécurisée (Locale + OAuth Google/Facebook).
*   **Nodemailer** : Service d'envoi d'emails transactionnels.

## ⚙️ Installation et Déploiement

### Prérequis
*   Node.js (v18 ou supérieur recommandé)
*   MongoDB (Instance locale ou Atlas)
*   NPM ou Yarn

### 1. Cloner le projet
```bash
git clone https://github.com/votre-username/ironfuel-nutrition.git
cd ironfuel-nutrition
```

### 2. Installation des dépendances
Installez les dépendances à la racine (Frontend) et dans le dossier backend.

**Frontend :**
```bash
npm install
```

**Backend :**
```bash
cd backend
npm install
cd ..
```

### 3. Configuration des Variables d'Environnement
Créez un fichier `.env` dans le dossier `backend/` avec les configurations suivantes :

```env
# Serveur
PORT=8080
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8080

# Base de données
MONGO_URI=mongodb://localhost:27017/ironfuel_db

# Sécurité
JWT_SECRET=votre_cle_secrete_ultra_longue_et_complexe_pour_signer_les_tokens

# Email (Mailtrap pour dev)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=votre_user_mailtrap
SMTP_PASSWORD=votre_pass_mailtrap
FROM_EMAIL=contact@ironfuel.tn
FROM_NAME=IronFuel Support

# OAuth (Optionnel)
GOOGLE_CLIENT_ID=votre_google_id
GOOGLE_CLIENT_SECRET=votre_google_secret
FACEBOOK_APP_ID=votre_facebook_id
FACEBOOK_APP_SECRET=votre_facebook_secret

# Paiement (Paymee - Sandbox)
PAYMEE_API_KEY=votre_cle_api_paymee
```

### 4. Lancement (Mode Développement)

Pour lancer le projet, ouvrez deux terminaux :

**Terminal 1 (Backend) :**
```bash
cd backend
npm run dev
```
*Le serveur API démarrera sur le port 8080 avec connexion à la BDD et seed des données initiales.*

**Terminal 2 (Frontend) :**
```bash
npm run dev
```
*L'application React sera accessible sur http://localhost:3000*

## 🎨 Design System & UX

Le design system d'IronFuel repose sur trois piliers :
1.  **L'Énergie :** Utilisation du **Vert Néon (#ccff00)** sur fond sombre pour guider l'œil vers les actions (CTA).
2.  **La Structure :** Utilisation de formes angulaires, de grilles visibles et d'effets "skew" (-12deg) pour évoquer le dynamisme et la vitesse.
3.  **La Matière :** Textures subtiles (fibre de carbone, bruit) pour donner de la profondeur et un aspect "premium/technique".

## 🔒 Gestion des Rôles

*   **Athlète (Client) :** Accès catalogue, panier, profil, commandes, favoris.
*   **Commandant (Admin) :** Accès complet au `/admin`.
    *   *Compte Admin par défaut (généré au premier lancement via `seeder.js`) :*
    *   Email : `admin@cosmeticsshop.com` (À changer en prod)
    *   Mot de passe : `password123`

## 📦 Structure du Projet

```bash
ironfuel/
├── components/       # Composants React (UI, Pages, Admin Panel)
│   ├── admin/        # Sous-composants du Back-office
│   ├── IconComponents.tsx # Bibliothèque d'icônes SVG optimisées
│   └── ...
├── utils/            # Utilitaires (API Wrapper, Socket config)
├── backend/          # API Serveur Node.js
│   ├── src/
│   │   ├── config/   # Config DB & Passport
│   │   ├── controllers/ # Logique métier (Auth, Products, Orders...)
│   │   ├── models/   # Schémas Mongoose
│   │   ├── routes/   # Routes Express
│   │   ├── utils/    # Seeder, Emailer
│   │   └── server.js # Point d'entrée
├── index.html        # Point d'entrée HTML
├── vite.config.ts    # Configuration Vite
└── ...
```

## 📄 Licence

Projet distribué sous la licence MIT. 
Conçu pour la performance. **No Pain, No Gain.** 💊
