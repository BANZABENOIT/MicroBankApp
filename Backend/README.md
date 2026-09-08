# FinAccess Backend

API REST PHP orientée objet, sans framework, utilisée par l'espace client et l'espace d'administration de FinAccess.

## Responsabilités

- authentification des clients et des administrateurs ;
- gestion des profils, comptes, épargnes, crédits et remboursements ;
- suivi des transactions financières ;
- opérations bancaires réservées à l'administration ;
- contrôle des droits selon le rôle associé au jeton d'authentification.

## Organisation

```text
Backend/
├── app/
│   ├── Core/           Routage, base de données, authentification et sécurité
│   ├── Controllers/    Traitement des requêtes par domaine métier
│   └── Models/         Accès aux données
├── config/config.php   Configuration de la base, des jetons et du CORS
├── database/schema.sql Schéma MySQL
├── routes/api.php      Déclaration des routes REST
├── public/index.php    Point d'entrée HTTP
├── autoload.php        Chargement automatique des classes
└── create_admin.php    Création d'un compte administrateur
```

## Prérequis

- PHP 8 ou version supérieure ;
- Apache avec `mod_rewrite` activé ;
- MySQL ou MariaDB ;
- accès à la commande `php` depuis un terminal.

## Installation

1. Créer la base de données en important `database/schema.sql` :

   ```bash
   mysql -u root -p < database/schema.sql
   ```

2. Vérifier les paramètres de connexion dans `config/config.php`. Par défaut, l'application utilise l'hôte `127.0.0.1`, l'utilisateur `root`, un mot de passe vide et la base `FinAccess`.
3. Si nécessaire, définir les variables d'environnement `FINACCESS_DB_HOST`, `FINACCESS_DB_NAME`, `FINACCESS_DB_USER`, `FINACCESS_DB_PASS` et `FINACCESS_CORS_ORIGINS`.
4. Configurer Apache pour que le dossier `public/` soit le point d'entrée de l'API.
5. Depuis le dossier `Backend`, créer le premier administrateur :

   ```bash
   php create_admin.php
   ```

## API

Toutes les routes sont préfixées par `/api`.

| Domaine                   | Routes principales                                                                                                                |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Authentification          | `POST /register`, `POST /login`, `POST /admin/login`                                                                              |
| Profil et tableau de bord | `GET /profile`, `PUT /profile`, `GET /dashboard`                                                                                  |
| Épargne                   | `GET /savings`, `POST /savings/deposit`, `POST /savings/withdraw`                                                                 |
| Comptes                   | `GET /accounts/mine`, `GET /accounts`                                                                                             |
| Crédits client            | `GET /loans/mine`, `POST /loans`, `GET /loans/{id}`, `POST /loans/{id}/repay`                                                     |
| Crédits administrateur    | `GET /loans`, `POST /loans/{id}/approve`, `POST /loans/{id}/reject`                                                               |
| Remboursements            | `POST /repayments`                                                                                                                |
| Transactions              | `GET /transactions`                                                                                                               |
| Administration            | `GET /clients`, `POST /clients`, `PUT /clients/{id}/status`, `GET /admin/dashboard`                                               |
| Banque                    | `GET /admin/bank`, `GET /admin/bank/history`, `POST /admin/bank/deposit`, `POST /admin/bank/withdraw`, `POST /admin/bank/capital` |

Les routes protégées attendent un jeton dans l'en-tête suivant :

```http
Authorization: Bearer <token>
```

## Base de données

Le fichier `database/schema.sql` crée notamment les tables `utilisateurs`, `api_tokens`, `clients`, `comptes`, `epargnes`, `credits`, `remboursements`, `transactions`, `banque_compte` et `banque_mouvements`.

## Sécurité

- mots de passe hachés avec l'API de hachage PHP ;
- jetons de session aléatoires avec durée de validité configurable ;
- requêtes préparées via PDO ;
- contrôle d'accès par authentification et rôle ;
- limitation des tentatives de connexion et blocage temporaire ;
- liste blanche CORS configurable ;
- validation des entrées et réponses JSON communes.

## Remarque

L'échéancier de remboursement est calculé côté application à partir des informations du crédit. Les remboursements réellement enregistrés sont conservés dans la table `remboursements` et les mouvements associés dans `transactions`.
