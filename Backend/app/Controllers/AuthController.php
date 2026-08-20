<?php

namespace App\Controllers;

use App\Core\Database;
use App\Core\Security;
use App\Models\Utilisateur;
use App\Models\Client;
use App\Models\Compte;

class AuthController
{
    public function register(): void
    {
        $data = Security::getJsonInput();

        $nom = Security::sanitizeString($data['nom'] ?? $data['name'] ?? '');
        $prenom = Security::sanitizeString($data['prenom'] ?? '');
        $email = trim($data['email'] ?? '');
        $telephone = Security::sanitizeString($data['telephone'] ?? $data['phone'] ?? '');
        $password = $data['password'] ?? $data['mot_de_passe'] ?? '';
        $adresse = Security::sanitizeString($data['adresse'] ?? $data['address'] ?? '') ?: null;
        $dateNaissance = trim($data['date_naissance'] ?? '') ?: null;
        $sexe = trim($data['sexe'] ?? '') ?: null;


        if ($prenom === '' && $nom !== '' && strpos($nom, ' ') !== false) {
            [$prenom, $nom] = array_pad(explode(' ', $nom, 2), 2, '');
        }

        if ($nom === '' || $email === '' || $telephone === '' || $password === '') {
            Security::jsonResponse(['success' => false, 'message' => 'Nom, email, téléphone et mot de passe sont requis.'], 422);
        }

        if ($adresse === null || $dateNaissance === null || $sexe === null) {
            Security::jsonResponse(['success' => false, 'message' => 'Adresse, date de naissance et sexe sont requis.'], 422);
        }

        if (!in_array($sexe, ['homme', 'femme'], true)) {
            Security::jsonResponse(['success' => false, 'message' => 'Sexe invalide.'], 422);
        }

        if (!Security::isValidEmail($email)) {
            Security::jsonResponse(['success' => false, 'message' => 'Adresse email invalide.'], 422);
        }

        if (strlen($password) < 8) {
            Security::jsonResponse(['success' => false, 'message' => 'Le mot de passe doit contenir au moins 8 caractères.'], 422);
        }

        if (Utilisateur::findByEmail($email)) {
            Security::jsonResponse(['success' => false, 'message' => 'Un compte existe déjà avec cet email.'], 409);
        }

        $pdo = Database::connect();
        $pdo->beginTransaction();

        try {
            $hash = Security::hashPassword($password);
            $utilisateurId = Utilisateur::create($nom, $prenom, $email, $telephone, $hash, 'client');

            $numeroClient = Client::generateNumeroClient();
            $clientId = Client::create($utilisateurId, $numeroClient, $adresse, $dateNaissance, $sexe);


            Compte::create($clientId);

            $pdo->commit();
        } catch (\Exception $e) {
            $pdo->rollBack();
            Security::jsonResponse(['success' => false, 'message' => 'Erreur lors de la création du compte.'], 500);
        }

        Security::jsonResponse([
            'success' => true,
            'message' => 'Compte créé avec succès.',
            'user' => ['id' => $utilisateurId, 'name' => trim("$prenom $nom"), 'email' => $email],
        ], 201);
    }

    public function login(): void
    {
        $data = Security::getJsonInput();
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? $data['mot_de_passe'] ?? '';

        if ($email === '' || $password === '') {
            Security::jsonResponse([
                'success' => false,
                'message' => 'Email et mot de passe requis.',
            ], 422);
        }

        $attempts = Security::tooManyAttempts('login:' . $email, 8, 300);

        if ($attempts) {
            Security::jsonResponse(['success' => false, 'message' => 'Trop de tentatives. Réessaie dans quelques minutes.'], 429);
        }

        $config = [
            'token_ttl_hours' => 24,
            'max_login_attempts' => 3,
            'lockout_minutes' => 15,
        ];
        $user = Utilisateur::findByEmail($email);

        if (!$user) {
            Security::jsonResponse([
                'success' => false,
                'message' => 'Email ou mot de passe incorrect.',
            ], 401);
        }

        if (!Security::verifyPassword($password, $user['mot_de_passe'])) {
            Utilisateur::registerFailedAttempt((int) $user['id'], $config['max_login_attempts'], $config['lockout_minutes']);
            Security::jsonResponse([
                'success' => false,
                'message' => 'Email ou mot de passe incorrect.',
            ], 401);
        }

        $user = Utilisateur::unlockIfExpired($user);


        if ($user['statut'] === 'bloque') {
            Security::jsonResponse([
                'success' => false,
                'message' => 'Compte temporairement bloqué suite à plusieurs échecs de connexion. Réessaie plus tard.',
            ], 403);
        }

        if ($user['statut'] === 'inactif') {
            Security::jsonResponse(['success' => false, 'message' => 'Ce compte est inactif.'], 403);
        }

        if ($user['role'] !== 'client') {
            Security::jsonResponse(['success' => false, 'message' => 'verifier vos identifiants.'], 403);
        }

        Utilisateur::resetFailedAttempts((int) $user['id']);
        $token = Security::generateToken();
        $expiresAt = date('Y-m-d H:i:s', time() + $config['token_ttl_hours'] * 3600);

        $pdo = Database::connect();
        $stmt = $pdo->prepare(
            'INSERT INTO api_tokens (user_id, token, expires_at) VALUES (?, ?, ?)'
        );

        $stmt->execute([$user['id'], $token, $expiresAt]);

        Security::jsonResponse([
            'success' => true,
            'message' => 'Connexion réussie.',
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'name' => trim($user['prenom'] . ' ' . $user['nom']),
                'email' => $user['email'],
                'role' => $user['role'],
            ],
        ]);
    }

    public function loginAdmin(): void
    {
        $data = Security::getJsonInput();
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? $data['mot_de_passe'] ?? '';

        if ($email === '' || $password === '') {
            Security::jsonResponse([
                'success' => false,
                'message' => 'Email et mot de passe requis.',
            ], 422);
        }

        $attempts = Security::tooManyAttempts('login:' . $email, 8, 300);

        if ($attempts) {
            Security::jsonResponse(['success' => false, 'message' => 'Trop de tentatives. Réessaie dans quelques minutes.'], 429);
        }

        $config = [
            'token_ttl_hours' => 24,
            'max_login_attempts' => 3,
            'lockout_minutes' => 15,
        ];
        $user = Utilisateur::findByEmail($email);

        if (!$user) {
            Security::jsonResponse([
                'success' => false,
                'message' => 'Email ou mot de passe incorrect.',
            ], 401);
        }

        if (!Security::verifyPassword($password, $user['mot_de_passe'])) {
            Utilisateur::registerFailedAttempt((int) $user['id'], $config['max_login_attempts'], $config['lockout_minutes']);
            Security::jsonResponse([
                'success' => false,
                'message' => 'Email ou mot de passe incorrect.',
            ], 401);
        }

        $user = Utilisateur::unlockIfExpired($user);


        if ($user['statut'] === 'bloque') {
            Security::jsonResponse([
                'success' => false,
                'message' => 'Compte temporairement bloqué suite à plusieurs échecs de connexion. Réessaie plus tard.',
            ], 403);
        }

        if ($user['statut'] === 'inactif') {
            Security::jsonResponse(['success' => false, 'message' => 'Ce compte est inactif.'], 403);
        }

        if ($user['role'] !== 'admin') {
            Security::jsonResponse(['success' => false, 'message' => 'verifier vos identifiants.'], 403);
        }

        Utilisateur::resetFailedAttempts((int) $user['id']);
        $token = Security::generateToken();
        $expiresAt = date('Y-m-d H:i:s', time() + $config['token_ttl_hours'] * 3600);

        $pdo = Database::connect();
        $stmt = $pdo->prepare(
            'INSERT INTO api_tokens (user_id, token, expires_at) VALUES (?, ?, ?)'
        );

        $stmt->execute([$user['id'], $token, $expiresAt]);

        Security::jsonResponse([
            'success' => true,
            'message' => 'Connexion réussie.',
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'name' => trim($user['prenom'] . ' ' . $user['nom']),
                'email' => $user['email'],
                'role' => $user['role'],
            ],
        ]);
    }
}
