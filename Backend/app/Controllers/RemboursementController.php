<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Security;
use App\Models\BanqueCompte;
use App\Models\Credit;

class RemboursementController
{
    public function record(): void
    {
        $auth = Auth::requireAdmin();
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

        try {
            BanqueCompte::recordRepayment(
                (int) $creditId,
                (int) $credit['compte_id'],
                (float) $amount,
                $paymentDate,
                $modeDb,
                (int) $auth['id']
            );
        } catch (\Throwable $e) {
            Security::jsonResponse(['success' => false, 'message' => $e->getMessage()], 422);
        }

        Security::jsonResponse(['success' => true, 'message' => 'Remboursement enregistré.']);
    }
}
