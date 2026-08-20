<?php

namespace App\Models;

use App\Core\Database;

class Remboursement
{
    public static function create(int $creditId, float $montant, string $dateRemboursement, string $modePaiement): int
    {
        $pdo = Database::connect();
        $reference = 'RB-' . strtoupper(bin2hex(random_bytes(4)));

        $stmt = $pdo->prepare(
            'INSERT INTO remboursements (credit_id, montant, date_remboursement, mode_paiement, reference)
             VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([$creditId, $montant, $dateRemboursement, $modePaiement, $reference]);
        return (int) $pdo->lastInsertId();
    }

    public static function listForCredit(int $creditId): array
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare('SELECT * FROM remboursements WHERE credit_id = ? ORDER BY date_remboursement ASC');
        $stmt->execute([$creditId]);
        return $stmt->fetchAll();
    }
}
