
# 💄 Cosmetics Shop - Plateforme E-commerce de Beauté

Une solution e-commerce complète et moderne dédiée à la vente de produits cosmétiques, de soins et de parfums. Cette application offre une expérience utilisateur fluide pour les clients et une interface d'administration puissante pour la gestion complète de la boutique.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🚀 Fonctionnalités

### Pour les Clients (Front-Office)
*   **Catalogue Interactif :** Navigation fluide par catégories, marques et collections.
*   **Recherche Avancée :** Barre de recherche avec autocomplétion et suggestions.
*   **Filtres Dynamiques :** Filtrage par prix, marque, et caractéristiques produits.
*   **Expérience d'Achat :** Panier d'achat avec persistance locale, calcul des frais de port et promotions.
*   **Paiement Sécurisé :** Intégration de passerelle de paiement (simulation Paymee) et option paiement à la livraison.
*   **Espace Client :** Gestion du profil, adresses de livraison, historique des commandes et liste de favoris.
*   **Comparateur :** Outil de comparaison de produits côte à côte.
*   **Social & Contenu :** Blog intégré, avis clients et partage social.
*   **Support Client :** Chat en temps réel intégré pour une assistance immédiate.

### Pour les Administrateurs (Back-Office)
*   **Tableau de Bord (Dashboard) :** Vue d'ensemble des KPIs (Revenus, Commandes, Nouveaux clients).
*   **Gestion du Catalogue :** CRUD complet pour les produits, catégories, packs promotionnels et stocks.
*   **Gestion des Commandes :** Suivi des statuts (En attente, Expédiée, Livrée) et génération de factures.
*   **Messagerie Support :** Interface administrateur pour répondre aux chats clients en temps réel (Socket.io).
*   **CMS Marketing :** Gestion des bannières publicitaires, carrousels et articles de blog.
*   **Gestion des Magasins :** Configuration des points de vente physiques et horaires.

## 🛠 Stack Technique

### Frontend
*   **React 18** : Architecture basée sur les composants et Hooks.
*   **TypeScript** : Typage statique pour une meilleure robustesse du code.
*   **Vite** : Environnement de développement et bundler haute performance.
*   **Tailwind CSS** : Design système utilitaire pour une interface responsive et moderne (Mode Sombre/Clair).
*   **Context API** : Gestion d'état global (Panier, Auth, Toast).

### Backend
*   **Node.js & Express** : API RESTful performante.
*   **MongoDB & Mongoose** : Base de données NoSQL pour une structure de données flexible.
*   **Socket.io** : Communication bidirectionnelle temps réel (Chat).
*   **JWT & Passport.js** : Authentification sécurisée (Local + OAuth Google/Facebook).

## ⚙️ Installation et Configuration

### Prérequis
*   Node.js (v16 ou supérieur)
*   MongoDB (Instance locale ou Atlas)
*   NPM ou Yarn

### 1. Cloner le projet
```bash
git clone https://github.com/votre-username/cosmetics-shop.git
cd cosmetics-shop
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
Créez un fichier `.env` dans le dossier `backend/` avec les variables suivantes :

```env
PORT=8080
MONGO_URI=mongodb://localhost:27017/cosmetics_shop
JWT_SECRET=votre_cle_secrete_jwt_complexe
FRONTEND_URL=http://localhost:3000

# Configuration Email (Optionnel - Pour réinitialisation mot de passe)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=votre_user
SMTP_PASSWORD=votre_pass

# Configuration OAuth (Optionnel)
GOOGLE_CLIENT_ID=votre_google_id
GOOGLE_CLIENT_SECRET=votre_google_secret
FACEBOOK_APP_ID=votre_facebook_id
FACEBOOK_APP_SECRET=votre_facebook_secret

# Paiement (Optionnel)
PAYMEE_API_KEY=votre_cle_paymee
```

### 4. Lancement de l'application

Pour lancer le projet en mode développement (Frontend + Backend), ouvrez deux terminaux :

**Terminal 1 (Backend) :**
```bash
cd backend
npm run dev
```
*Le serveur démarrera sur http://localhost:8080*

**Terminal 2 (Frontend) :**
```bash
npm run dev
```
*L'application sera accessible sur http://localhost:3000*

## 📂 Structure du Projet

```
cosmetics-shop/
├── components/       # Composants React (UI, Pages, Admin)
│   ├── admin/        # Composants spécifiques au Back-office
│   └── ...
├── utils/            # Utilitaires (API Wrapper, Socket config)
├── backend/          # API Serveur
│   ├── src/
│   │   ├── config/   # Config DB & Passport
│   │   ├── controllers/ # Logique métier
│   │   ├── models/   # Schémas Mongoose
│   │   ├── routes/   # Définition des endpoints API
│   │   └── server.js # Point d'entrée serveur
├── index.html        # Point d'entrée HTML
├── vite.config.ts    # Configuration Vite (Proxy, Build)
└── ...
```

## 🔒 Rôles et Accès

*   **Client :** Accès libre au catalogue. Création de compte nécessaire pour commander et chatter.
*   **Admin :** Accès complet au Dashboard via `/admin`.
    *   *Compte Admin par défaut (généré au premier lancement) :*
    *   Email : `admin@electroshop.com` (ou cosmetics selon config)
    *   Mot de passe : `password123`

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1.  Forkez le projet.
2.  Créez votre branche de fonctionnalité (`git checkout -b feature/NouvelleFonctionnalite`).
3.  Commitez vos changements (`git commit -m 'feat: Ajout d'une nouvelle fonctionnalité'`).
4.  Poussez vers la branche (`git push origin feature/NouvelleFonctionnalite`).
5.  Ouvrez une Pull Request.

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
