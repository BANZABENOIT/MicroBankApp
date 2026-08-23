<?php

namespace App\Models;

use App\Core\Database;

class Credit
{
    public static function create(int $clientId, int $compteId, float $montantDemande, int $dureeMois, ?string $motif): int
    {
        $taux = isset($data['interest_rate']) ? (float) $data['interest_rate'] : 5.0;
        $pdo = Database::connect();
        $stmt = $pdo->prepare(
            'INSERT INTO credits (client_id, compte_id, montant_demande, taux_interet, duree_mois, motif, statut, date_demande)
             VALUES (?, ?, ?, ?, ?, ?, "en_attente", NOW())'
        );
        $stmt->execute([$clientId, $compteId, $montantDemande, $taux, $dureeMois, $motif]);
        return (int) $pdo->lastInsertId();
    }

    public static function findById(int $id): ?array
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare('SELECT * FROM credits WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function listForClient(int $clientId): array
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare('SELECT * FROM credits WHERE client_id = ? ORDER BY date_demande DESC');
        $stmt->execute([$clientId]);
        return $stmt->fetchAll();
    }


    public static function listAll(): array
    {
        $pdo = Database::connect();
        $stmt = $pdo->query(
            'SELECT cr.*, CONCAT(u.prenom, " ", u.nom) AS client_nom, c.numero_client
             FROM credits cr
             JOIN clients c ON c.id = cr.client_id
             JOIN utilisateurs u ON u.id = c.utilisateur_id
             ORDER BY cr.date_demande DESC'
        );
        return $stmt->fetchAll();
    }

    public static function approve(int $id, float $montantAccorde, float $tauxInteret): void
    {
        $pdo = Database::connect();
        $credit = self::findById($id);
        $echeance = date('Y-m-d H:i:s', strtotime("+{$credit['duree_mois']} months"));

        $stmt = $pdo->prepare(
            'UPDATE credits
             SET statut = "approuve", montant_accorde = ?, taux_interet = ?, date_approbation = NOW(), date_echeance = ?
             WHERE id = ?'
        );
        $stmt->execute([$montantAccorde, $tauxInteret, $echeance, $id]);
    }

    public static function reject(int $id): void
    {
        $pdo = Database::connect();
        $pdo->prepare('UPDATE credits SET statut = "refuse" WHERE id = ?')->execute([$id]);
    }

    public static function updateStatus(int $id, string $status): void
    {
        $pdo = Database::connect();
        $pdo->prepare('UPDATE credits SET statut = ? WHERE id = ?')->execute([$status, $id]);
    }

    public static function totalRembourse(int $creditId): float
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare('SELECT COALESCE(SUM(montant), 0) FROM remboursements WHERE credit_id = ?');
        $stmt->execute([$creditId]);
        return (float) $stmt->fetchColumn();
    }

    public static function countActiveForClient(int $clientId): int
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare(
            "SELECT COUNT(*) FROM credits WHERE client_id = ? AND statut IN ('approuve', 'en_cours')"
        );
        $stmt->execute([$clientId]);
        return (int) $stmt->fetchColumn();
    }

    public static function countCompletedForClient(int $clientId): int
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare(
            "SELECT COUNT(*) FROM credits WHERE client_id = ? AND statut = 'rembourse'"
        );
        $stmt->execute([$clientId]);
        return (int) $stmt->fetchColumn();
    }

    public static function countPendingForClient(int $clientId): int
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare(
            "SELECT COUNT(*) FROM credits WHERE client_id = ? AND statut = 'en_attente'"
        );
        $stmt->execute([$clientId]);
        return (int) $stmt->fetchColumn();
    }

    public static function countUpcomingPayementsForClient(int $clientId, int $days = 30): int
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare(
            "SELECT COUNT(*) FROM credits WHERE client_id = ? AND statut IN ('approuve', 'en_cours') AND date_echeance IS NOT NULL AND date_echeance BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL ? DAY)"
        );
        $stmt->execute([$clientId, $days]);
        return (int) $stmt->fetchColumn();
    }

    public static function sumActiveAmountForClient(int $clientId): float
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare(
            "SELECT COALESCE(SUM(montant_accorde), 0) FROM credits WHERE client_id = ? AND statut IN ('approuve', 'en_cours')"
        );
        $stmt->execute([$clientId]);
        return (float) $stmt->fetchColumn();
    }
}
