<?php

return [
    'db' => [
        'host' => '127.0.0.1',
        'name' => 'FinAccess',
        'user' => 'root',
        'pass' => '',
        'charset' => 'utf8mb4',
    ],
    'token_ttl_hours' => 24,
    'max_login_attempts' => 3,
    'lockout_minutes' => 15,
    'cors_allowed_origins' => [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
    ],
];
