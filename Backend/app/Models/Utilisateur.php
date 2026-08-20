<?php

namespace App\Models;

use App\Core\Database;

class Utilisateur
{
    public static function findByEmail(string $email): ?array
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare('SELECT * FROM utilisateurs WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        return $user ?: null;
    }

    public static function findById(int $id): ?array
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare('SELECT * FROM utilisateurs WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function create(string $nom, string $prenom, string $email, string $telephone, string $hash, string $role = 'client', string $statut='actif'): int
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare(
            'INSERT INTO utilisateurs (nom, prenom, email, telephone, mot_de_passe, role, statut, tentatives_connexion, date_creation) VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW())'
        );
        $stmt->execute([$nom, $prenom, $email, $telephone, $hash, $role, $statut]);
        return (int) $pdo->lastInsertId();
    }



    public static function registerFailedAttempt(int $userId, int $maxAttempts, int $lockoutMinutes): void
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare('SELECT tentatives_connexion FROM utilisateurs WHERE id = ?');
        $stmt->execute([$userId]);
        $attempts = (int) $stmt->fetchColumn() + 1;

        if ($attempts >= $maxAttempts) {
            $lockUntil = date('Y-m-d H:i:s', time() + $lockoutMinutes * 60);
            $update = $pdo->prepare(
                'UPDATE utilisateurs SET tentatives_connexion = ?, statut = "bloque", bloque_jusqua = ? WHERE id = ?'
            );
            $update->execute([$attempts, $lockUntil, $userId]);
        } else {
            $update = $pdo->prepare('UPDATE utilisateurs SET tentatives_connexion = ? WHERE id = ?');
            $update->execute([$attempts, $userId]);
        }
    }

    public static function resetFailedAttempts(int $userId): void
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare('UPDATE utilisateurs SET tentatives_connexion = 0 WHERE id = ?');
        $stmt->execute([$userId]);
    }


    public static function unlockIfExpired(array $user): array
    {
        if ($user['statut'] === 'bloque' && $user['bloque_jusqua'] !== null && strtotime($user['bloque_jusqua']) < time()) {
            $pdo = Database::connect();
            $stmt = $pdo->prepare(
                'UPDATE utilisateurs SET statut = "actif", tentatives_connexion = 0, bloque_jusqua = NULL WHERE id = ?'
            );
            $stmt->execute([$user['id']]);
            $user['statut'] = 'actif';
            $user['tentatives_connexion'] = 0;
            $user['bloque_jusqua'] = null;
        }
        return $user;
    }
}
