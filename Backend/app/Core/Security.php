<?php

namespace App\Core;

class Security
{
    // A02:2021 Défaillances cryptographiques

    public static function hashPassword(string $password): string
    {
        return password_hash($password, PASSWORD_BCRYPT);
    }

    public static function verifyPassword(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }

    public static function generateToken(): string
    {
        return bin2hex(random_bytes(32));
    }

    // A03:2021  Injection (XSS)

    public static function sanitizeString(?string $value): string
    {
        return trim(htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8'));
    }

    

    public static function isValidEmail(string $email): bool
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    public static function isPositiveNumber($value): bool
    {
        return is_numeric($value) && $value > 0;
    }

    // A05:2021 - Mauvaise configuration de sécurité

    public static function setSecurityHeaders(): void
    {
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header("Content-Security-Policy: default-src 'none'");
        ini_set('display_errors', '0');
        error_reporting(0);
    }

    // A05:2021  CORS

    public static function handleCors(): void
    {
        $config = require __DIR__ . '/../../config/config.php';
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        if (in_array($origin, $config['cors_allowed_origins'], true)) {
            header("Access-Control-Allow-Origin: $origin");
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }

    // A04/A07:2021  Rate limiting anti brute-force

    public static function tooManyAttempts(string $key, int $maxAttempts = 5, int $windowSeconds = 300): bool
    {
        $dir = sys_get_temp_dir() . '/finaccess_rate_limit';
        if (!is_dir($dir)) {
            mkdir($dir, 0700, true);
        }

        $file = $dir . '/' . md5($key) . '.json';
        $now = time();
        $attempts = [];

        if (file_exists($file)) {
            $attempts = json_decode(file_get_contents($file), true) ?: [];
            $attempts = array_filter($attempts, fn($t) => $t > $now - $windowSeconds);
        }

        if (count($attempts) >= $maxAttempts) {
            return true;
        }

        $attempts[] = $now;
        file_put_contents($file, json_encode($attempts));
        return false;
    }

    

    public static function jsonResponse(array $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function getJsonInput(): array
    {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }
}
