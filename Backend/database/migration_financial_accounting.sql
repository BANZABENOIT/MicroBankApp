USE finaccess;

ALTER TABLE api_tokens
    CHANGE COLUMN user_id utilisateur_id INT UNSIGNED NOT NULL;

ALTER TABLE clients
    CHANGE COLUMN adress adresse VARCHAR(255) NOT NULL;

ALTER TABLE banque_compte
    MODIFY COLUMN solde DECIMAL(17,2) NOT NULL DEFAULT 0.00,
    MODIFY COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE banque_mouvements
    MODIFY COLUMN type ENUM('depot', 'retrait', 'decaissement_credit', 'remboursement', 'capital_initial') NOT NULL,
    ADD COLUMN frais DECIMAL(15,2) NOT NULL DEFAULT 0.00 AFTER montant,
    ADD COLUMN reference_operation VARCHAR(40) NULL AFTER effectue_par;

UPDATE banque_mouvements
SET reference_operation = CONCAT('LEGACY-', id)
WHERE reference_operation IS NULL;

ALTER TABLE banque_mouvements
    MODIFY COLUMN effectue_par INT UNSIGNED NULL,
    MODIFY COLUMN reference_operation VARCHAR(40) NOT NULL,
    ADD UNIQUE KEY uq_banque_mouvements_reference (reference_operation);

INSERT INTO banque_compte (id, solde)
VALUES (1, 0.00)
ON DUPLICATE KEY UPDATE id = id;