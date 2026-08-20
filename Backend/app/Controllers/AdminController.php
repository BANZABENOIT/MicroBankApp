<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Database;
use App\Core\Security;
use App\Models\Client;

class AdminController
{
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
