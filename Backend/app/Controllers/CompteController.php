<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Security;
use App\Models\Client;
use App\Models\Compte;

class CompteController
{
    
    public function mine(): void
    {
        $auth = Auth::requireAuth();
        $client = Client::findByUtilisateurId($auth['id']);
        $comptes = Compte::findByClientId((int) $client['id']);

        Security::jsonResponse([
            'success' => true,
            'accounts' => array_map(fn($c) => [
                'id' => $c['id'],
                'reference' => $c['numero_compte'],
                'type' => 'Compte principal',
                'balance' => (float) $c['solde'],
                'status' => $c['statut'],
            ], $comptes),
        ]);
    }

    
    public function all(): void
    {
        Auth::requireAdmin();
        $comptes = Compte::listAll();

        Security::jsonResponse([
            'success' => true,
            'accounts' => array_map(fn($c) => [
                'id' => $c['id'],
                'reference' => $c['numero_compte'],
                'clientName' => $c['client_nom'],
                'type' => 'Courant',
                'balance' => (float) $c['solde'],
                'status' => $c['statut'],
            ], $comptes),
        ]);
    }
}
