
# 🛒 Electro Shop - Plateforme E-commerce Moderne

Bienvenue sur le dépôt d'**Electro Shop**, une solution e-commerce complète dédiée à la vente de produits électroniques et électroménagers. Cette application offre une expérience utilisateur fluide pour les clients et une interface d'administration puissante pour la gestion du magasin.

![Aperçu du projet](https://via.placeholder.com/1200x600?text=Aper%C3%A7u+Electro+Shop)

## 🚀 Fonctionnalités Principales

### Pour les Clients
*   **Catalogue Intuitif :** Navigation par catégories, recherche avancée et filtres dynamiques.
*   **Expérience d'Achat :** Gestion du panier, processus de commande (Checkout) simplifié et suivi de commande.
*   **Outils Utilisateur :** Gestion des favoris, comparateur de produits et historique des commandes.
*   **Support en Temps Réel :** Widget de chat en direct pour communiquer avec le support.
*   **Interface Adaptative :** Design entièrement responsive (Mobile, Tablette, Desktop) avec mode Sombre/Clair.

### Pour les Administrateurs
*   **Tableau de Bord (Dashboard) :** Vue d'ensemble des ventes, statistiques et indicateurs clés.
*   **Gestion de Stock :** CRUD complet pour les produits, les packs promotionnels et les catégories.
*   **Suivi des Commandes :** Gestion des statuts de commande (En attente, Expédiée, Livrée).
*   **Messagerie Admin :** Interface dédiée pour répondre aux clients en temps réel via Socket.io.
*   **Marketing :** Gestion des bannières publicitaires et des promotions.

## 🛠 Technologies Utilisées

### Frontend
*   **React 18** : Bibliothèque UI principale.
*   **TypeScript** : Pour un code robuste et typé.
*   **Vite** : Bundler ultra-rapide.
*   **Tailwind CSS** : Framework CSS pour un design moderne et responsive.
*   **Socket.io Client** : Pour la communication temps réel.

### Backend
*   **Node.js & Express** : Serveur API REST.
*   **MongoDB & Mongoose** : Base de données NoSQL.
*   **Socket.io** : Gestion des websockets pour le chat.
*   **JWT** : Authentification sécurisée.

## ⚙️ Installation et Configuration

Suivez ces étapes pour lancer le projet localement.

### Prérequis
*   Node.js (v16 ou supérieur)
*   MongoDB (Installé localement ou instance Atlas)

### 1. Cloner le dépôt
```bash
git clone https://github.com/votre-utilisateur/electro-shop.git
cd electro-shop
```

### 2. Installation du Frontend
À la racine du projet :
```bash
npm install
```

### 3. Installation du Backend
Accédez au dossier backend et installez les dépendances :
```bash
cd backend
npm install
```

### 4. Configuration des variables d'environnement
Créez un fichier `.env` dans le dossier `backend` avec les variables suivantes :
```env
PORT=8080
MONGO_URI=mongodb://localhost:27017/electroshop
JWT_SECRET=votre_secret_super_securise
FRONTEND_URL=http://localhost:3000
```

## ▶️ Lancement du Projet

Pour une expérience complète, vous devez lancer le serveur backend et le client frontend.

**1. Démarrer le Backend (API & Socket)**
```bash
cd backend
npm run dev
# Le serveur démarrera sur http://localhost:8080
```

**2. Démarrer le Frontend**
Ouvrez un nouveau terminal à la racine du projet :
```bash
npm run dev
# L'application sera accessible sur http://localhost:3000
```

## 📂 Structure du Projet

```
electro-shop/
├── components/       # Composants React (UI, Admin, Client)
├── utils/            # Utilitaires (API, Socket)
├── backend/          # Serveur Node.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/   # Schémas Mongoose
│   │   ├── routes/
│   │   └── server.js
├── index.html
├── package.json
└── vite.config.ts
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une "Issue" pour discuter des changements majeurs avant de soumettre une "Pull Request".

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
