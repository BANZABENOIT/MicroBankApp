<?php

namespace App\Models;

use App\Core\Database;

class Client
{
    public static function findByUtilisateurId(int $utilisateurId): ?array
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare('SELECT c.*, u.nom, u.prenom, u.email, u.telephone, u.statut AS statut_utilisateur FROM clients c JOIN utilisateurs u ON u.id = c.utilisateur_id WHERE utilisateur_id = ?');
        $stmt->execute([$utilisateurId]);
        return $stmt->fetch() ?: null;
    }

    public static function findById(int $id): ?array
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare(
            'SELECT c.*, u.nom, u.prenom, u.email, u.telephone, u.statut AS statut_utilisateur
             FROM clients c JOIN utilisateurs u ON u.id = c.utilisateur_id
             WHERE c.id = ?'
        );
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function create(int $utilisateurId, string $numeroClient, ?string $adresse, ?string $dateNaissance, ?string $sexe): int
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare(
            'INSERT INTO clients (utilisateur_id, numero_client, adress, date_naissance, sexe) VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([$utilisateurId, $numeroClient, $adresse, $dateNaissance, $sexe]);
        return (int) $pdo->lastInsertId();
    }

    public static function generateNumeroClient(): string
    {
        $pdo = Database::connect();
        $count = (int) $pdo->query('SELECT COUNT(*) FROM clients')->fetchColumn() + 1;
        return 'CLI-' . str_pad((string) $count, 5, '0', STR_PAD_LEFT);
    }


    public static function listAll(): array
    {
        $pdo = Database::connect();
        $stmt = $pdo->query(
            'SELECT c.id, c.numero_client, u.nom, u.prenom, u.email, u.telephone, u.statut, c.date_creation
             FROM clients c JOIN utilisateurs u ON u.id = c.utilisateur_id
             ORDER BY c.date_creation DESC'
        );
        return $stmt->fetchAll();
    }

    public static function updateProfile(int $clientId, ?string $adresse): void
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare('UPDATE clients SET adresse = ? WHERE id = ?');
        $stmt->execute([$adresse, $clientId]);
    }
}
