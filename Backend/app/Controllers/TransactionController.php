<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Security;
use App\Models\Client;
use App\Models\Transaction;

class TransactionController
{
    public function index(): void
    {
        $auth = Auth::requireAuth();

        if ($auth['role'] === 'admin') {
            $transactions = Transaction::listAll();
            Security::jsonResponse([
                'success' => true,
                'transactions' => array_map(fn($t) => $this->format($t, true), $transactions),
            ]);
            return;
        }

        $client = Client::findByUtilisateurId($auth['id']);
        $transactions = Transaction::listForClient((int) $client['id']);

        Security::jsonResponse([
            'success' => true,
            'transactions' => array_map(fn($t) => $this->format($t, false), $transactions),
        ]);
    }

    private function format(array $t, bool $withClientName): array
    {
        $isCredit = $t['type_transaction'] === 'credit' || $t['solde_apres'] > $t['solde_avant'];

        $result = [
            'id' => $t['id'],
            'date' => date('d/m/Y', strtotime($t['date_transaction'])),
            'type' => $t['type_transaction'],
            'amount' => $isCredit ? (float) $t['montant'] : -(float) $t['montant'],
        ];

        if ($withClientName) {
            $result['clientName'] = $t['client_nom'];
        }

        return $result;
    }
}
