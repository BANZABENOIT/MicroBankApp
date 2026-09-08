<?php

ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
error_reporting(0);

require_once __DIR__ . '/../autoload.php';

use App\Core\Security;

// CORS liste blanche d'origines + gestion du preflight OPTIONS
Security::handleCors();

// Headers de sécurité A05 + désactivation de l'affichage des erreurs PHP
Security::setSecurityHeaders();
header('Content-Type: application/json');

$router = require __DIR__ . '/../routes/api.php';

$router->dispatch();
