<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Security;
use App\Models\Client;
use App\Models\Compte;
use App\Models\Credit;
use App\Models\Epargne;
use App\Models\Transaction;
use App\Models\Utilisateur;

class ClientController
{
    public function profile(): void
    {
        $auth = Auth::requireAuth();
        $client = Client::findByUtilisateurId($auth['id']);

        if (!$client) {
            Security::jsonResponse(['success' => false, 'message' => 'Profil introuvable.'], 404);
        }

        Security::jsonResponse([
            'success' => true,
            'profile' => [
                'name' => trim($client['prenom'] . ' ' . $client['nom']),
                'email' => $client['email'],
                'phone' => $client['telephone'],
                'reference' => $client['numero_client'],
                'address' => $client['adress'],
                'createdAt' => date('d/m/Y', strtotime($client['date_creation'])),
            ],
        ]);
    }

    public function updateProfile(): void
    {
        $auth = Auth::requireAuth();
        $client = Client::findByUtilisateurId($auth['id']);
        $data = Security::getJsonInput();

        $adresse = Security::sanitizeString($data['address'] ?? $data['adresse'] ?? '') ?: null;
        Client::updateProfile((int) $client['id'], $adresse);

        Security::jsonResponse(['success' => true, 'message' => 'Profil mis à jour.']);
    }

    public function dashboard(): void
    {
        
        $auth = Auth::requireAuth();

        if ($auth['role'] === 'admin') {
            (new AdminController())->dashboard();
            return;
        }

        $client = Client::findByUtilisateurId($auth['id']);
        if (!$client) {
            Security::jsonResponse(['success' => false, 'message' => 'Profil introuvable.'], 404);
        }

        $clientId = (int) $client['id'];
        $compte = Compte::findPrincipalByClientId($clientId);
        $totalBalance = $compte ? (float) $compte['solde'] : 0;
        $totalSavings = Epargne::balanceForClient($clientId);
        $activeCreditsAmount = Credit::sumActiveAmountForClient($clientId);

        $recentTx = Transaction::recentForClient($clientId, 5);
        $recentTransactions = array_map(function ($tx) {
            $sign = in_array($tx['type_transaction'], ['epargne'], true) && $tx['solde_apres'] > $tx['solde_avant'] ? 1 : -1;
            $isCredit = $tx['type_transaction'] === 'credit';
            return [
                'id' => $tx['id'],
                'date' => date('d/m/Y', strtotime($tx['date_transaction'])),
                'label' => $tx['description'] ?: ucfirst($tx['type_transaction']),
                'amount' => $isCredit || $tx['solde_apres'] > $tx['solde_avant'] ? (float) $tx['montant'] : -(float) $tx['montant'],
            ];
        }, $recentTx);

        Security::jsonResponse([
            'success' => true,
            'totalBalance' => $totalBalance,
            'activeCreditsAmount' => $activeCreditsAmount,
            'totalSavings' => $totalSavings,
            'upcomingPayments' => Credit::countUpcomingPayementsForClient($clientId),
            'creditsOverview' => [
                'inProgress' => Credit::countActiveForClient($clientId),
                'completed' => Credit::countCompletedForClient($clientId),
                'pending' => Credit::countPendingForClient($clientId),
            ],
            'recentTransactions' => $recentTransactions,
        ]);
    }
}
