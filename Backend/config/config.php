<?php

$env = static function (string $key, mixed $default = null): mixed {
    $value = getenv($key);
    return $value === false || $value === '' ? $default : $value;
};

$allowedOrigins = array_values(array_filter(array_map('trim', explode(',', (string) $env(
    'FINACCESS_CORS_ORIGINS',
    'http://localhost:5173,http://localhost:5174,http://localhost:5175'
)))));

return [
    'db' => [
        'host' => $env('FINACCESS_DB_HOST', '127.0.0.1'),
        'name' => $env('FINACCESS_DB_NAME', 'FinAccess'),
        'user' => $env('FINACCESS_DB_USER', 'root'),
        'pass' => $env('FINACCESS_DB_PASS', ''),
        'charset' => $env('FINACCESS_DB_CHARSET', 'utf8mb4'),
    ],
    'token_ttl_hours' => (int) $env('FINACCESS_TOKEN_TTL_HOURS', 24),
    'max_login_attempts' => (int) $env('FINACCESS_MAX_LOGIN_ATTEMPTS', 3),
    'lockout_minutes' => (int) $env('FINACCESS_LOCKOUT_MINUTES', 15),
    'cors_allowed_origins' => $allowedOrigins,
];
