<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Security;
use App\Models\BanqueCompte;
use App\Models\Compte;

class BanqueController
{
    public function summary(): void
    {
        Auth::requireAdmin();
        Security::jsonResponse(['success' => true, 'bank' => BanqueCompte::summary()]);
    }

    public function history(): void
    {
        Auth::requireAdmin();
        Security::jsonResponse(['success' => true, 'movements' => BanqueCompte::history()]);
    }

    public function capital(): void
    {
        $auth = Auth::requireAdmin();
        $data = Security::getJsonInput();
        $amount = (float) ($data['amount'] ?? 0);

        if (!Security::isPositiveNumber($amount)) {
            Security::jsonResponse(['success' => false, 'message' => 'Montant de capital valide requis.'], 422);
        }

        try {
            BanqueCompte::injectCapital($amount, (int) $auth['id']);
            Security::jsonResponse(['success' => true, 'message' => 'Capital initial injecté.', 'bank' => BanqueCompte::summary()]);
        } catch (\Throwable $e) {
            Security::jsonResponse(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    public function deposit(): void
    {
        $auth = Auth::requireAdmin();
        $data = Security::getJsonInput();
        $accountId = (int) ($data['accountId'] ?? 0);
        $amount = (float) ($data['amount'] ?? 0);

        if ($accountId <= 0 || !Security::isPositiveNumber($amount)) {
            Security::jsonResponse(['success' => false, 'message' => 'Compte et montant valides requis.'], 422);
        }

        try {
            $account = Compte::findById($accountId);
            if (!$account) {
                Security::jsonResponse(['success' => false, 'message' => 'Compte introuvable.'], 404);
            }
            BanqueCompte::deposit($accountId, $amount, (int) $auth['id']);
            Security::jsonResponse(['success' => true, 'message' => 'Dépôt effectué.', 'bank' => BanqueCompte::summary()]);
        } catch (\Throwable $e) {
            Security::jsonResponse(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    public function withdraw(): void
    {
        $auth = Auth::requireAdmin();
        $data = Security::getJsonInput();
        $accountId = (int) ($data['accountId'] ?? 0);
        $amount = (float) ($data['amount'] ?? 0);
        $fee = (float) ($data['fee'] ?? 0);

        if ($accountId <= 0 || !Security::isPositiveNumber($amount) || $fee < 0) {
            Security::jsonResponse(['success' => false, 'message' => 'Compte, montant et frais valides requis.'], 422);
        }

        try {
            $account = Compte::findById($accountId);
            if (!$account) {
                Security::jsonResponse(['success' => false, 'message' => 'Compte introuvable.'], 404);
            }
            BanqueCompte::withdraw($accountId, $amount, $fee, (int) $auth['id']);
            Security::jsonResponse(['success' => true, 'message' => 'Retrait effectué.', 'bank' => BanqueCompte::summary()]);
        } catch (\Throwable $e) {
            Security::jsonResponse(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }
}
