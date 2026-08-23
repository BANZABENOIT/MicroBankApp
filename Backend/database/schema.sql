
CREATE DATABASE IF NOT EXISTS finaccess CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE finaccess;

CREATE TABLE utilisateurs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telephone VARCHAR(30) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    role ENUM('client','admin') NOT NULL DEFAULT 'client',
    statut ENUM('actif','inactif','bloque') NOT NULL DEFAULT 'actif',
    tentatives_connexion TINYINT UNSIGNED NOT NULL DEFAULT 0,
    bloque_jusqua DATETIME NULL,
    date_creation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE api_tokens (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT UNSIGNED NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    date_creation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE clients (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT UNSIGNED NOT NULL UNIQUE,
    numero_client VARCHAR(30) NOT NULL UNIQUE,
    adresse VARCHAR(255) NOT NULL,
    date_naissance DATE NOT NULL,
    sexe ENUM('homme','femme') NOT NULL,
    date_creation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE comptes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    client_id INT UNSIGNED NOT NULL,
    numero_compte VARCHAR(30) NOT NULL UNIQUE,
    solde DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    devise CHAR(3) NOT NULL DEFAULT 'BIF',
    statut ENUM('actif','inactif') NOT NULL DEFAULT 'actif',
    date_creation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE epargnes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    client_id INT UNSIGNED NOT NULL,
    compte_id INT UNSIGNED NOT NULL,
    type ENUM('depot','retrait') NOT NULL,
    montant DECIMAL(15,2) NOT NULL,
    solde_avant DECIMAL(15,2) NOT NULL,
    solde_apres DECIMAL(15,2) NOT NULL,
    date_operation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reference VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    date_transaction DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (compte_id) REFERENCES comptes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE credits (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    client_id INT UNSIGNED NOT NULL,
    compte_id INT UNSIGNED NOT NULL,
    montant_demande DECIMAL(15,2) NOT NULL,
    montant_accorde DECIMAL(15,2) NULL,
    taux_interet DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    duree_mois INT NOT NULL,
    motif TEXT NULL,
    statut ENUM('en_attente','approuve','refuse','en_cours','rembourse','annule') NOT NULL DEFAULT 'en_attente',
    date_demande DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_approbation DATETIME NULL,
    date_echeance DATETIME NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (compte_id) REFERENCES comptes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE remboursements (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    credit_id INT UNSIGNED NOT NULL,
    montant DECIMAL(15,2) NOT NULL,
    date_remboursement DATE NOT NULL,
    mode_paiement ENUM('espece','virement','autre') NOT NULL DEFAULT 'espece',
    reference VARCHAR(100) NOT NULL UNIQUE,
    date_enregistrement DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (credit_id) REFERENCES credits(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE transactions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    compte_id INT UNSIGNED NOT NULL,
    type_transaction ENUM('epargne','credit','remboursement','autre') NOT NULL,
    montant DECIMAL(15,2) NOT NULL,
    solde_avant DECIMAL(15,2) NOT NULL,
    solde_apres DECIMAL(15,2) NOT NULL,
    description TEXT NULL,
    date_transaction DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (compte_id) REFERENCES comptes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE banque_compte (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    solde DECIMAL(5,2) NOT NULL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE banque_mouvements (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    type ENUM('depot', 'remboursement', 'capital_initial') NOT NULL,
    montant DECIMAL(15,2) NOT NULL,
    client_id INT UNSIGNED NULL,
    credit_id INT UNSIGNED NULL,
    effectue_par INT NULL COMMENT 'id de l\'agent ou admin qui a réalisé l\'opération',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (credit_id) REFERENCES credits(id)
) ENGINE=InnoDB;