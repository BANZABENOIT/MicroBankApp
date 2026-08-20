# FinAccess — Interface d'Administration (React)

## Présentation

Ce dépôt contient l'interface d'administration de FinAccess, destinée au personnel gérant la plateforme de micro-finance : suivi des clients, traitement des demandes de crédit, gestion des comptes et des remboursements.

## Fonctionnalités

- Connexion administrateur sécurisée
- Tableau de bord avec statistiques globales (clients actifs, comptes, crédits en cours, demandes en attente) et graphique d'évolution des crédits
- Gestion des clients (liste, recherche, filtrage)
- Traitement des demandes de crédit (consultation du détail, approbation, refus)
- Gestion des comptes bancaires des clients
- Enregistrement manuel des remboursements
- Historique complet des transactions de la plateforme

## Stack technique

- **React** (Vite)
- **React Router DOM**
- **Redux Toolkit** + **React Redux**
- **Axios**
- **React Toastify**
- **React Icons**
- CSS natif ; le graphique du tableau de bord est réalisé en SVG natif, sans librairie externe

## Structure du projet

```
src/
├── api/                  Configuration des appels HTTP vers le backend
├── redux/
│   ├── store.js
│   └── slices/           Un slice par domaine métier (auth, clients, crédits, comptes, remboursements, transactions, dashboard)
├── components/           Mise en page (barre latérale, en-tête), composants réutilisables
├── pages/                Une page par écran administrateur
├── App.jsx
└── main.jsx
```

## Installation

```bash
npm install
```

Dépendances principales : `react-router-dom`, `axios`, `@reduxjs/toolkit`, `react-redux`, `react-toastify`, `react-icons`.

## Configuration

L'URL de l'API backend est définie dans `src/api/axiosClient.js` et doit pointer vers le même backend que l'application client.

## Lancement

```bash
npm run dev
```

## Accès administrateur

Un compte administrateur doit être créé côté backend (voir le README du backend, script `create_admin.php`) — l'inscription en libre-service n'est pas proposée pour ce rôle, par mesure de sécurité.

## Sécurité côté client

- Accès aux pages conditionné à la présence d'un jeton de session valide.
- Le rôle de l'utilisateur connecté (administrateur) est vérifié côté serveur à chaque requête sensible, indépendamment de l'affichage côté client.
