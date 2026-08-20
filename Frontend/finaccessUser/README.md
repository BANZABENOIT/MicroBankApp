# FinAccess — Application Client (React)

## Présentation

FinAccess est une application de micro-finance permettant aux clients de gérer leur compte, leur épargne et leurs crédits en ligne. Ce dépôt contient l'interface **espace client**, développée avec React.

## Fonctionnalités

- Inscription et connexion sécurisées
- Tableau de bord avec vue d'ensemble (solde, crédits en cours, épargne, paiements à venir)
- Gestion du profil personnel
- Consultation et demande de crédits, avec suivi de l'échéancier de remboursement
- Gestion de l'épargne (dépôts, retraits, historique)
- Consultation des comptes bancaires
- Historique complet des transactions

## Stack technique

- **React** (Vite)
- **React Router DOM** — navigation entre les pages
- **Redux Toolkit** + **React Redux** — gestion de l'état global de l'application
- **Axios** — communication avec l'API backend
- **React Toastify** — notifications utilisateur
- **React Icons** — iconographie
- CSS natif (aucun framework CSS tiers)

## Structure du projet

```
src/
├── api/                  Configuration des appels HTTP vers le backend
├── redux/
│   ├── store.js
│   └── slices/           Un slice par domaine métier (auth, dashboard, crédits, épargne, comptes, transactions)
├── components/           Composants réutilisables (mise en page, cartes, graphiques, modales)
├── pages/                Une page par écran de l'application
├── App.jsx               Déclaration des routes
└── main.jsx               Point d'entrée
```

## Installation

```bash
npm install
```

Dépendances principales : `react-router-dom`, `axios`, `@reduxjs/toolkit`, `react-redux`, `react-toastify`, `react-icons`.

## Configuration

L'URL de l'API backend est définie dans `src/api/axiosClient.js` :

```js
const API_BASE_URL = "http://localhost/FinAccessTp/FinAccess/Backend/public/api";
```

À adapter selon l'environnement de déploiement.

## Lancement

```bash
npm run dev
```

L'application est accessible sur `http://localhost:5173` par défaut.

## Sécurité côté client

- Le jeton d'authentification est transmis via l'en-tête `Authorization: Bearer` sur chaque requête.
- Les routes protégées (tableau de bord, profil, crédits, etc.) sont inaccessibles sans connexion active.
- Toute entrée utilisateur est validée avant envoi au serveur.
