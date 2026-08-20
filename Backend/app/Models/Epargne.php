<?php

namespace App\Models;

use App\Core\Database;

class Epargne
{
    public static function record(int $clientId, int $compteId, string $type, float $montant, float $soldeAvant, float $soldeApres, ?string $description = null): int
    {
        $pdo = Database::connect();
        $reference = 'EP-' . strtoupper(bin2hex(random_bytes(4)));

        $stmt = $pdo->prepare(
            'INSERT INTO epargnes (client_id, compte_id, type, montant, solde_avant, solde_apres, date_operation, reference, description)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?)'
        );
        $stmt->execute([$clientId, $compteId, $type, $montant, $soldeAvant, $soldeApres, $reference, $description]);
        return (int) $pdo->lastInsertId();
    }

    public static function balanceForClient(int $clientId): float
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare(
            "SELECT COALESCE(SUM(CASE WHEN type = 'dépôt' THEN montant ELSE -montant END), 0)
             FROM epargnes WHERE client_id = ?"
        );
        $stmt->execute([$clientId]);
        return (float) $stmt->fetchColumn();
    }

    public static function historyForClient(int $clientId): array
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare(
            'SELECT * FROM epargnes WHERE client_id = ? ORDER BY date_operation DESC'
        );
        $stmt->execute([$clientId]);
        return $stmt->fetchAll();
    }
}
