<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Security;
use App\Models\Compte;
use App\Models\Credit;
use App\Models\Remboursement;
use App\Models\Transaction;

class RemboursementController
{
    public function record(): void
    {
        Auth::requireAdmin();
        $data = Security::getJsonInput();

        $creditId = $data['creditId'] ?? null;
        $amount = $data['amount'] ?? null;
        $paymentDate = $data['paymentDate'] ?? date('Y-m-d');
        $mode = $data['paymentMethod'] ?? 'espece';

        if (!$creditId || !Security::isPositiveNumber($amount)) {
            Security::jsonResponse(['success' => false, 'message' => 'Crédit et montant valides requis.'], 422);
        }

        $credit = Credit::findById((int) $creditId);
        if (!$credit) {
            Security::jsonResponse(['success' => false, 'message' => 'Crédit introuvable.'], 404);
        }

        $modeDb = match (strtolower($mode)) {
            'mobile money', 'espèces', 'especes' => 'espece',
            'virement bancaire', 'virement' => 'virement',
            default => 'autre',
        };

        Remboursement::create((int) $creditId, (float) $amount, $paymentDate, $modeDb);

        
        $compte = Compte::findById((int) $credit['compte_id']);
        $soldeAvant = (float) $compte['solde'];
        Transaction::record((int) $compte['id'], 'remboursement', (float) $amount, $soldeAvant, $soldeAvant, 'Remboursement enregistré par l\'admin');

        $totalPaid = Credit::totalRembourse((int) $creditId);
        if ($totalPaid >= (float) $credit['montant_accorde']) {
            Credit::updateStatus((int) $creditId, 'rembourse');
        } else {
            Credit::updateStatus((int) $creditId, 'en_cours');
        }

        Security::jsonResponse(['success' => true, 'message' => 'Remboursement enregistré.']);
    }
}
