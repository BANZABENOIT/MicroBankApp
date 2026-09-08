# FinAccess

Application fullstack de microfinance composée d'une API PHP et de deux interfaces React : un espace client et un espace d'administration.

## Fonctionnalités

- inscription et connexion des clients ;
- consultation des comptes, soldes et transactions ;
- gestion de l'épargne : dépôts, retraits et historique ;
- demande, suivi et remboursement des crédits ;
- gestion administrative des clients et des comptes ;
- approbation ou refus des demandes de crédit ;
- suivi des remboursements et des opérations bancaires.

## Architecture

```text
FinAccess_TP_OWASP/
├── Backend/                    API REST PHP et base de données
│   ├── app/                    Core, contrôleurs et modèles
│   ├── config/                 Configuration de l'application
│   ├── database/               Schéma MySQL
│   ├── public/                 Point d'entrée Apache
│   └── routes/                 Routes de l'API
└── Frontend/
    ├── finaccess/              Interface d'administration React
    └── finaccessUser/          Interface client React
```

## Technologies

### Backend

- PHP orienté objet ;
- API REST ;
- MySQL ou MariaDB ;
- PDO et authentification par jeton Bearer.

### Frontend

- React avec Vite ;
- React Router DOM ;
- Redux Toolkit ;
- Axios ;
- React Toastify et React Icons ;
- CSS natif.

## Prérequis

- XAMPP ou un environnement Apache/PHP/MySQL équivalent ;
- PHP 8 ou version supérieure ;
- Node.js et npm ;
- MySQL ou MariaDB.

## Installation

### 1. Backend et base de données

Consulter [Backend/README.md](Backend/README.md) pour le détail de la configuration PHP, l'import du schéma et la création du compte administrateur.

Le backend doit être accessible par Apache à l'adresse utilisée par les clients HTTP, par exemple :

```text
http://localhost/ESPOIR_KIPANZA_BENOIT_24100505_TP/FinAccess_TP_OWASP/Backend/public/api
```

### 2. Interface d'administration

```bash
cd Frontend/finaccess
npm install
npm run dev
```

### 3. Interface client

```bash
cd Frontend/finaccessUser
npm install
npm run dev
```

Vite affiche l'URL de chaque interface dans le terminal, généralement `http://localhost:5173` pour la première application et un autre port si nécessaire.

## Configuration de l'API frontend

Les deux applications utilisent la variable `VITE_API_URL`. Elle doit contenir l'URL complète du backend, avec le suffixe `/api` :

```text
VITE_API_URL=http://localhost/ESPOIR_KIPANZA_BENOIT_24100505_TP/FinAccess_TP_OWASP/Backend/public/api
```

La valeur par défaut est déjà définie dans les clients Axios de chaque frontend. Après modification d'une variable Vite, relancer le serveur de développement.

## Comptes et rôles

- **Client** : inscription, gestion du profil, épargne, comptes et crédits.
- **Administrateur** : connexion dédiée, gestion des clients, crédits, remboursements, transactions et opérations bancaires.

Le compte administrateur initial se crée avec `Backend/create_admin.php`. Les droits sont contrôlés par le backend, même si les interfaces masquent les écrans qui ne correspondent pas au rôle connecté.

## Commandes utiles

Dans chaque frontend :

```bash
npm run dev      # serveur de développement
npm run build    # build de production
npm run lint     # vérification ESLint
npm run preview  # prévisualisation du build
```

## Documentation complémentaire

- [Documentation de l'API et du backend](Backend/README.md)
- [README de l'interface d'administration](Frontend/finaccess/README.md)
- [README de l'interface client](Frontend/finaccessUser/README.md)
