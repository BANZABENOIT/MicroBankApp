<?php

require_once __DIR__ . '/autoload.php';

use App\Core\Database;
use App\Core\Security;

$pdo = Database::connect();

$email = 'admin@finaccess.com';
$password = 'Admin123!';

$existing = $pdo->prepare('SELECT id FROM utilisateurs WHERE email = ?');
$existing->execute([$email]);

if ($existing->fetch()) {
    echo "Le compte admin existe déjà ($email).\n";
    exit;
}

$hash = Security::hashPassword($password);

$stmt = $pdo->prepare(
    "INSERT INTO utilisateurs (nom, prenom, email, telephone, mot_de_passe, role, statut)
     VALUES ('Admin', 'FinAccess', ?, '+25700000000', ?, 'admin', 'actif')"
);
$stmt->execute([$email, $hash]);

echo "Compte admin créé avec succès !\n";
echo "Email    : $email\n";
echo "Mot de passe : $password\n";
echo " Change ce mot de passe dès que possible.\n";
