<?php

namespace App\Core;

class Auth
{

    public static function requireAuth(): array
    {
        $header = self::getAuthorizationHeader();

        if (!$header || !preg_match('/Bearer\s+(.+)/i', $header, $matches)) {
            Security::jsonResponse(['success' => false, 'message' => 'Authentification requise.'], 401);
        }

        $token = $matches[1];
        $pdo = Database::connect();

        $stmt = $pdo->prepare(
            'SELECT u.id, u.role, u.statut
             FROM api_tokens t
             JOIN utilisateurs u ON u.id = t.user_id
             WHERE t.token = ? AND t.expires_at > NOW()'
        );
        $stmt->execute([$token]);
        $row = $stmt->fetch();

        if (!$row) {
            Security::jsonResponse(['success' => false, 'message' => 'Token invalide ou expiré.'], 401);
        }

        if ($row['statut'] !== 'actif') {
            Security::jsonResponse(['success' => false, 'message' => 'Compte inactif ou bloqué.'], 403);
        }

        return ['id' => (int) $row['id'], 'role' => $row['role']];
    }

    
    public static function requireAdmin(): array
    {
        $user = self::requireAuth();

        if ($user['role'] !== 'admin') {
            Security::jsonResponse(['success' => false, 'message' => 'Accès réservé aux administrateurs.'], 403);
        }

        return $user;
    }

    private static function getAuthorizationHeader(): ?string
    {
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            return $_SERVER['HTTP_AUTHORIZATION'];
        }

        if (function_exists('apache_request_headers')) {
            foreach (apache_request_headers() as $name => $value) {
                if (strtolower($name) === 'authorization') {
                    return $value;
                }
            }
        }

        return null;
    }
}
