<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Security;
use App\Models\Client;
use App\Models\Compte;
use App\Models\Epargne;
use App\Models\Transaction;

class EpargneController
{
    public function show(): void
    {
        $auth = Auth::requireAuth();
        $client = Client::findByUtilisateurId($auth['id']);
        $clientId = (int) $client['id'];

        $balance = Epargne::balanceForClient($clientId);
        $history = Epargne::historyForClient($clientId);

        Security::jsonResponse([
            'success' => true,
            'balance' => $balance,
            'history' => array_map(fn($h) => [
                'id' => $h['id'],
                'date' => date('d/m/Y', strtotime($h['date_operation'])),
                'type' => $h['type'] === 'dépôt' ? 'deposit' : 'withdrawal',
                'amount' => $h['type'] === 'dépôt' ? (float) $h['montant'] : -(float) $h['montant'],
            ], $history),
        ]);
    }

    public function deposit(): void
    {
        $this->operate('dépôt');
    }

    public function withdraw(): void
    {
        $this->operate('retrait');
    }

    private function operate(string $type): void
    {
        $auth = Auth::requireAuth();
        $client = Client::findByUtilisateurId($auth['id']);
        $clientId = (int) $client['id'];
        $compte = Compte::findPrincipalByClientId($clientId);

        $data = Security::getJsonInput();
        $amount = $data['amount'] ?? null;

        if (!Security::isPositiveNumber($amount)) {
            Security::jsonResponse(['success' => false, 'message' => 'Montant invalide.'], 422);
        }
        $amount = (float) $amount;

        $soldeAvant = (float) $compte['solde'];

        if ($type === 'retrait') {
            if (!Compte::debit((int) $compte['id'], $amount)) {
                Security::jsonResponse(['success' => false, 'message' => 'Solde insuffisant.'], 422);
            }
        } else {
            Compte::credit((int) $compte['id'], $amount);
        }

        $soldeApres = $type === 'retrait' ? $soldeAvant - $amount : $soldeAvant + $amount;

        Epargne::record($clientId, (int) $compte['id'], $type, $amount, $soldeAvant, $soldeApres);
        Transaction::record(
            (int) $compte['id'],
            'epargne',
            $amount,
            $soldeAvant,
            $soldeApres,
            $type === 'dépôt' ? 'Dépôt épargne' : 'Retrait épargne'
        );

        Security::jsonResponse([
            'success' => true,
            'message' => $type === 'dépôt' ? 'Dépôt effectué.' : 'Retrait effectué.',
            'balance' => Epargne::balanceForClient($clientId),
        ]);
    }
}
