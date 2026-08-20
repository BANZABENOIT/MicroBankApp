<?php

namespace App\Models;

use App\Core\Database;

class Compte
{
    public static function create(int $clientId, string $devise = 'BIF', string $statut = 'actif'): int
    {
        $pdo = Database::connect();
        $numero = self::generateNumeroCompte();
        $stmt = $pdo->prepare(
            'INSERT INTO comptes (client_id, numero_compte, solde, devise, statut, date_creation) VALUES (?, ?, 0, ?, ?, NOW())'
        );
        $stmt->execute([$clientId, $numero, $devise, $statut]);
        return (int) $pdo->lastInsertId();
    }

    public static function generateNumeroCompte(): string
    {
        $pdo = Database::connect();
        $count = (int) $pdo->query('SELECT COUNT(*) FROM comptes')->fetchColumn() + 1;
        return 'FA-CPT-' . str_pad((string) $count, 5, '0', STR_PAD_LEFT);
    }

    public static function findByClientId(int $clientId): array
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare('SELECT * FROM comptes WHERE client_id = ?');
        $stmt->execute([$clientId]);
        return $stmt->fetchAll();
    }

   
    public static function findPrincipalByClientId(int $clientId): ?array
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare('SELECT * FROM comptes WHERE client_id = ? ORDER BY id ASC LIMIT 1');
        $stmt->execute([$clientId]);
        return $stmt->fetch() ?: null;
    }

    public static function findById(int $id): ?array
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare('SELECT * FROM comptes WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function listAll(): array
    {
        $pdo = Database::connect();
        $stmt = $pdo->query(
            'SELECT co.*, CONCAT(u.prenom, " ", u.nom) AS client_nom
             FROM comptes co
             JOIN clients c ON c.id = co.client_id
             JOIN utilisateurs u ON u.id = c.utilisateur_id
             ORDER BY co.date_creation DESC'
        );
        return $stmt->fetchAll();
    }


    public static function credit(int $compteId, float $amount): float
    {
        $pdo = Database::connect();
        $pdo->prepare('UPDATE comptes SET solde = solde + ? WHERE id = ?')->execute([$amount, $compteId]);
        return (float) self::findById($compteId)['solde'];
    }


    public static function debit(int $compteId, float $amount): bool
    {
        $pdo = Database::connect();
        $pdo->beginTransaction();

        $stmt = $pdo->prepare('SELECT solde FROM comptes WHERE id = ? FOR UPDATE');
        $stmt->execute([$compteId]);
        $solde = (float) $stmt->fetchColumn();

        if ($solde < $amount) {
            $pdo->rollBack();
            return false;
        }

        $pdo->prepare('UPDATE comptes SET solde = solde - ? WHERE id = ?')->execute([$amount, $compteId]);
        $pdo->commit();
        return true;
    }
}
