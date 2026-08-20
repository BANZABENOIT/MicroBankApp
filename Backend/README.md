# FinAccess Backend (PHP, Programmation Orientée Objet)

## Présentation

Backend de l'application FinAccess, développé en PHP orienté objet sans framework. Il expose une API REST unique, utilisée à la fois par l'application client et par l'interface d'administration ; le comportement de certaines routes s'adapte selon le rôle (client ou administrateur) porté par le jeton de connexion.

## Architecture

```
Backend/
├── app/
│   ├── Core/            Router, connexion base de données, sécurité, authentification
│   ├── Controllers/      Logique métier par ressource (authentification, crédits, comptes, épargne, transactions, remboursements, administration)
│   └── Models/            Accès aux données (une classe par table)
├── config/
│   └── config.php         Paramètres de connexion et de sécurité
├── database/
│   └── schema.sql          Script de création de la base de données
├── routes/
│   └── api.php              Déclaration des routes de l'API
├── public/
│   ├── index.php             Point d'entrée de l'application
│   └── .htaccess
├── autoload.php              Chargement automatique des classes
└── create_admin.php          Script de création d'un compte administrateur
```

## Base de données

Le schéma (`database/schema.sql`) comprend les tables suivantes :

| Table | Rôle |
| `utilisateurs` | Comptes de connexion (rôle client ou administrateur), avec gestion du blocage après tentatives échouées |
| `clients` | Profil métier du client, lié à un utilisateur |
| `comptes` | Comptes bancaires des clients |
| `epargnes` | Opérations de dépôt et de retrait d'épargne |
| `credits` | Demandes et contrats de crédit |
| `remboursements` | Paiements effectués sur un crédit |
| `transactions` | Journal centralisé de tous les mouvements financiers |
| `api_tokens` | Jetons de session pour l'authentification |

## Installation

1. Créer la base de données à partir de `database/schema.sql`.
2. Renseigner les identifiants de connexion dans `config/config.php`.
3. Servir le dossier `public/` via Apache (`mod_rewrite` activé).
4. Créer un compte administrateur :
   ```bash
   php create_admin.php
   ```

## Points d'entrée de l'API

| Domaine | Exemples de routes |
| Authentification | `POST /api/register`, `POST /api/login` |
| Profil | `GET /api/profile`, `PUT /api/profile` |
| Tableau de bord | `GET /api/dashboard` |
| Épargne | `GET /api/savings`, `POST /api/savings/deposit`, `POST /api/savings/withdraw` |
| Comptes | `GET /api/accounts/mine`, `GET /api/accounts` |
| Crédits | `GET /api/loans/mine`, `POST /api/loans`, `GET /api/loans/{id}`, `POST /api/loans/{id}/repay`, `POST /api/loans/{id}/approve`, `POST /api/loans/{id}/reject` |
| Remboursements | `POST /api/repayments` |
| Transactions | `GET /api/transactions` |
| Administration | `GET /api/clients` |

## Sécurité mise en œuvre

Le développement s'appuie sur les recommandations OWASP Top 10 :

- **Contrôle d'accès** : vérification systématique du jeton et du rôle sur les routes sensibles ; un client ne peut consulter ou modifier que ses propres données.
- **Cryptographie** : mots de passe hachés (bcrypt), jetons de session générés de manière cryptographiquement aléatoire.
- **Prévention des injections** : requêtes préparées PDO sur l'ensemble des accès à la base de données ; échappement systématique des entrées affichées.
- **Authentification renforcée** : blocage automatique d'un compte après plusieurs tentatives de connexion échouées, avec déblocage temporisé ; jetons de session à durée de vie limitée.
- **Configuration sécurisée** : liste blanche d'origines autorisées (CORS), en-têtes de sécurité HTTP, désactivation de l'affichage des erreurs en environnement de production.

## Notes

L'échéancier de remboursement affiché côté client est calculé à la volée (mensualités réparties sur la durée du crédit) et n'est pas stocké ligne par ligne en base de données.
