<?php

namespace App\Models;

use App\Core\Database;

class Transaction
{
    public static function record(int $compteId, string $type, float $montant, float $soldeAvant, float $soldeApres, ?string $description = null): int
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare(
            'INSERT INTO transactions (compte_id, type_transaction, montant, solde_avant, solde_apres, description)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([$compteId, $type, $montant, $soldeAvant, $soldeApres, $description]);
        return (int) $pdo->lastInsertId();
    }

    public static function listForClient(int $clientId): array
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare(
            'SELECT t.* FROM transactions t
             JOIN comptes co ON co.id = t.compte_id
             WHERE co.client_id = ?
             ORDER BY t.date_transaction DESC'
        );
        $stmt->execute([$clientId]);
        return $stmt->fetchAll();
    }

    public static function listAll(): array
    {
        $pdo = Database::connect();
        $stmt = $pdo->query(
            'SELECT t.*, CONCAT(u.prenom, " ", u.nom) AS client_nom
             FROM transactions t
             JOIN comptes co ON co.id = t.compte_id
             JOIN clients c ON c.id = co.client_id
             JOIN utilisateurs u ON u.id = c.utilisateur_id
             ORDER BY t.date_transaction DESC
             LIMIT 200'
        );
        return $stmt->fetchAll();
    }

    public static function recentForClient(int $clientId, int $limit = 5): array
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare(
            'SELECT t.* FROM transactions t
             JOIN comptes co ON co.id = t.compte_id
             WHERE co.client_id = ?
             ORDER BY t.date_transaction DESC
             LIMIT ' . (int) $limit
        );
        $stmt->execute([$clientId]);
        return $stmt->fetchAll();
    }
}
