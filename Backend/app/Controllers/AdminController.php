<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Database;
use App\Core\Security;
use App\Models\Client;
use App\Models\Compte;
use App\Models\Utilisateur;

class AdminController
{
    public function createClient(): void
    {
        Auth::requireAdmin();
        $data = Security::getJsonInput();
        $nom = Security::sanitizeString($data['nom'] ?? $data['name'] ?? '');
        $prenom = Security::sanitizeString($data['prenom'] ?? '');
        $email = trim((string) ($data['email'] ?? ''));
        $telephone = Security::sanitizeString($data['telephone'] ?? $data['phone'] ?? '');
        $password = (string) ($data['password'] ?? '');
        $adresse = Security::sanitizeString($data['adresse'] ?? $data['address'] ?? '');
        $dateNaissance = trim((string) ($data['date_naissance'] ?? ''));
        $sexe = trim((string) ($data['sexe'] ?? ''));

        if ($nom === '' || $prenom === '' || $email === '' || $telephone === '' || strlen($password) < 8 || $adresse === '' || $dateNaissance === '' || !in_array($sexe, ['homme', 'femme'], true)) {
            Security::jsonResponse(['success' => false, 'message' => 'Tous les champs client sont requis et le mot de passe doit contenir 8 caractères.'], 422);
        }
        if (!Security::isValidEmail($email)) {
            Security::jsonResponse(['success' => false, 'message' => 'Adresse email invalide.'], 422);
        }
        if (Utilisateur::findByEmail($email)) {
            Security::jsonResponse(['success' => false, 'message' => 'Un compte existe déjà avec cet email.'], 409);
        }

        $pdo = Database::connect();
        $pdo->beginTransaction();
        $clientId = 0;
        try {
            $userId = Utilisateur::create($nom, $prenom, $email, $telephone, Security::hashPassword($password));
            $clientId = Client::create($userId, Client::generateNumeroClient(), $adresse, $dateNaissance, $sexe);
            Compte::create($clientId);
            $pdo->commit();
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            Security::jsonResponse(['success' => false, 'message' => 'Impossible de créer le client.'], 500);
        }

        $client = Client::findById($clientId);
        Security::jsonResponse([
            'success' => true,
            'message' => 'Client créé avec succès.',
            'client' => [
                'id' => $client['id'],
                'reference' => $client['numero_client'],
                'name' => trim($client['prenom'] . ' ' . $client['nom']),
                'phone' => $client['telephone'],
                'email' => $client['email'],
                'status' => $client['statut_utilisateur'],
            ],
        ], 201);
    }

    public function updateClientStatus(string $id): void
    {
        Auth::requireAdmin();
        $data = Security::getJsonInput();
        $status = $data['status'] ?? '';
        if (!in_array($status, ['actif', 'inactif', 'bloque'], true)) {
            Security::jsonResponse(['success' => false, 'message' => 'Statut invalide.'], 422);
        }
        $client = Client::findById((int) $id);
        if (!$client) {
            Security::jsonResponse(['success' => false, 'message' => 'Client introuvable.'], 404);
        }
        Client::updateUserStatus((int) $client['utilisateur_id'], $status);
        Security::jsonResponse(['success' => true, 'message' => 'Statut client mis à jour.', 'status' => $status]);
    }

    public function clients(): void
    {
        Auth::requireAdmin();
        $clients = Client::listAll();

        Security::jsonResponse([
            'success' => true,
            'clients' => array_map(fn($c) => [
                'id' => $c['id'],
                'reference' => $c['numero_client'],
                'name' => trim($c['prenom'] . ' ' . $c['nom']),
                'phone' => $c['telephone'],
                'email' => $c['email'],
                'status' => $c['statut'],
            ], $clients),
        ]);
    }

    public function dashboard(): void
    {
        Auth::requireAdmin();
        $pdo = Database::connect();

        $totalClients = (int) $pdo->query('SELECT COUNT(*) FROM clients')->fetchColumn();
        $activeAccounts = (int) $pdo->query("SELECT COUNT(*) FROM comptes WHERE statut = 'actif'")->fetchColumn();
        $activeLoans = (int) $pdo->query("SELECT COUNT(*) FROM credits WHERE statut IN ('approuve','en_cours')")->fetchColumn();
        $pendingRequests = (int) $pdo->query("SELECT COUNT(*) FROM credits WHERE statut = 'en_attente'")->fetchColumn();


        $labels = [];
        $granted = [];
        $repaid = [];

        $moisFr = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

        for ($i = 5; $i >= 0; $i--) {
            $monthStart = date('Y-m-01', strtotime("-$i months"));
            $monthEnd = date('Y-m-t', strtotime("-$i months"));
            $labels[] = $moisFr[(int) date('n', strtotime($monthStart)) - 1];

            $stmtG = $pdo->prepare(
                "SELECT COALESCE(SUM(montant_accorde), 0) FROM credits WHERE date_approbation BETWEEN ? AND ?"
            );
            $stmtG->execute([$monthStart, $monthEnd . ' 23:59:59']);
            $granted[] = (float) $stmtG->fetchColumn();

            $stmtR = $pdo->prepare(
                "SELECT COALESCE(SUM(montant), 0) FROM remboursements WHERE date_remboursement BETWEEN ? AND ?"
            );
            $stmtR->execute([$monthStart, $monthEnd]);
            $repaid[] = (float) $stmtR->fetchColumn();
        }

        $activities = $this->recentActivities($pdo);

        Security::jsonResponse([
            'success' => true,
            'stats' => [
                'clients' => $totalClients,
                'activeAccounts' => $activeAccounts,
                'activeLoans' => $activeLoans,
                'pendingRequests' => $pendingRequests,
            ],
            'chart' => [
                'labels' => $labels,
                'granted' => $granted,
                'repaid' => $repaid,
            ],
            'activities' => $activities,
        ]);
    }

    private function recentActivities($pdo): array
    {
        $stmt = $pdo->query(
            "SELECT CONCAT('Nouvelle demande de crédit par ', u.prenom, ' ', u.nom) AS message, cr.date_demande AS date
             FROM credits cr
             JOIN clients c ON c.id = cr.client_id
             JOIN utilisateurs u ON u.id = c.utilisateur_id
             ORDER BY cr.date_demande DESC LIMIT 5"
        );
        $rows = $stmt->fetchAll();

        return array_map(fn($r) => [
            'id' => uniqid(),
            'message' => $r['message'],
            'time' => $this->timeAgo($r['date']),
        ], $rows);
    }

    private function timeAgo(string $datetime): string
    {
        $diff = time() - strtotime($datetime);
        if ($diff < 3600) return round($diff / 60) . ' min';
        if ($diff < 86400) return round($diff / 3600) . ' h';
        return round($diff / 86400) . ' j';
    }
}
