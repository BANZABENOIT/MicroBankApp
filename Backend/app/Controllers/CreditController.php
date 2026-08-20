<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Security;
use App\Models\Client;
use App\Models\Compte;
use App\Models\Credit;
use App\Models\Remboursement;
use App\Models\Transaction;

class CreditController
{
    // --- Côté client ---

    public function mine(): void
    {
        $auth = Auth::requireAuth();
        $client = Client::findByUtilisateurId($auth['id']);
        $credits = Credit::listForClient((int) $client['id']);

        Security::jsonResponse([
            'success' => true,
            'loans' => array_map(fn($c) => $this->formatSummary($c), $credits),
        ]);
    }

    public function requestCredit(): void
    {
        $auth = Auth::requireAuth();
        $client = Client::findByUtilisateurId($auth['id']);
        $compte = Compte::findPrincipalByClientId((int) $client['id']);

        $data = Security::getJsonInput();
        $amount = $data['amount'] ?? null;
        $duration = $data['duration_months'] ?? null;
        $reason = Security::sanitizeString($data['reason'] ?? '');

        if (!Security::isPositiveNumber($amount) || !Security::isPositiveNumber($duration)) {
            Security::jsonResponse(['success' => false, 'message' => 'Montant et durée doivent être des nombres positifs.'], 422);
        }

        $creditId = Credit::create((int) $client['id'], (int) $compte['id'], (float) $amount, (int) $duration, $reason ?: null);

        Security::jsonResponse(['success' => true, 'message' => 'Demande de crédit envoyée.', 'loan_id' => $creditId], 201);
    }

    public function show(string $id): void
    {
        $auth = Auth::requireAuth();
        $credit = Credit::findById((int) $id);

        if (!$credit) {
            Security::jsonResponse(['success' => false, 'message' => 'Crédit introuvable.'], 404);
        }

        
        if ($auth['role'] !== 'admin') {
            $client = Client::findByUtilisateurId($auth['id']);
            if ((int) $credit['client_id'] !== (int) $client['id']) {
                Security::jsonResponse(['success' => false, 'message' => 'Accès refusé.'], 403);
            }
        }

        $paid = Credit::totalRembourse((int) $id);
        $remboursements = Remboursement::listForCredit((int) $id);

        Security::jsonResponse([
            'success' => true,
            'loan' => [
                'id' => $credit['id'],
                'reference' => 'CR-' . str_pad((string) $credit['id'], 4, '0', STR_PAD_LEFT),
                'status' => $this->mapStatus($credit['statut']),
                'amount' => (float) ($credit['montant_accorde'] ?? $credit['montant_demande']),
                'durationMonths' => (int) $credit['duree_mois'],
                'interestRate' => (float) $credit['taux_interet'],
                'createdAt' => date('d/m/Y', strtotime($credit['date_demande'])),
                'dueDate' => $credit['date_echeance'] ? date('d/m/Y', strtotime($credit['date_echeance'])) : null,
                'amountPaid' => $paid,
                'schedule' => $this->buildSchedule($credit, $remboursements),
            ],
        ]);
    }

    public function repay(string $id): void
    {
        $auth = Auth::requireAuth();
        $client = Client::findByUtilisateurId($auth['id']);
        $credit = Credit::findById((int) $id);

        if (!$credit || (int) $credit['client_id'] !== (int) $client['id']) {
            Security::jsonResponse(['success' => false, 'message' => 'Accès refusé.'], 403);
        }

        if (!in_array($credit['statut'], ['approuve', 'en_cours'], true)) {
            Security::jsonResponse(['success' => false, 'message' => 'Ce crédit n\'est pas en cours de remboursement.'], 422);
        }

        $data = Security::getJsonInput();
        $amount = $data['amount'] ?? null;
        if (!Security::isPositiveNumber($amount)) {
            Security::jsonResponse(['success' => false, 'message' => 'Montant invalide.'], 422);
        }
        $amount = (float) $amount;

        $compte = Compte::findById((int) $credit['compte_id']);
        $soldeAvant = (float) $compte['solde'];

        if (!Compte::debit((int) $compte['id'], $amount)) {
            Security::jsonResponse(['success' => false, 'message' => 'Solde insuffisant sur ton compte.'], 422);
        }

        Remboursement::create((int) $id, $amount, date('Y-m-d'), 'autre');
        Transaction::record((int) $compte['id'], 'remboursement', $amount, $soldeAvant, $soldeAvant - $amount, 'Remboursement crédit');

        $totalPaid = Credit::totalRembourse((int) $id);
        if ($totalPaid >= (float) $credit['montant_accorde']) {
            Credit::updateStatus((int) $id, 'rembourse');
        } else {
            Credit::updateStatus((int) $id, 'en_cours');
        }

        Security::jsonResponse(['success' => true, 'message' => 'Remboursement effectué.']);
    }

    // --- Côté admin ---

    public function all(): void
    {
        Auth::requireAdmin();
        $credits = Credit::listAll();

        Security::jsonResponse([
            'success' => true,
            'loans' => array_map(function ($c) {
                $s = $this->formatSummary($c);
                $s['clientName'] = $c['client_nom'];
                $s['clientReference'] = $c['numero_client'];
                $s['reason'] = $c['motif'];
                return $s;
            }, $credits),
        ]);
    }

    public function approve(string $id): void
    {
        Auth::requireAdmin();
        $credit = Credit::findById((int) $id);

        if (!$credit || $credit['statut'] !== 'en_attente') {
            Security::jsonResponse(['success' => false, 'message' => 'Cette demande ne peut pas être approuvée.'], 422);
        }

        $data = Security::getJsonInput();
        $montantAccorde = Security::isPositiveNumber($data['amount'] ?? null) ? (float) $data['amount'] : (float) $credit['montant_demande'];
        $taux = isset($data['interest_rate']) ? (float) $data['interest_rate'] : 5.0;

        Credit::approve((int) $id, $montantAccorde, $taux);

        
        $compte = Compte::findById((int) $credit['compte_id']);
        $soldeAvant = (float) $compte['solde'];
        Compte::credit((int) $compte['id'], $montantAccorde);
        Transaction::record((int) $compte['id'], 'credit', $montantAccorde, $soldeAvant, $soldeAvant + $montantAccorde, 'Prêt accordé');

        Security::jsonResponse(['success' => true, 'message' => 'Demande approuvée et fonds décaissés.']);
    }

    public function reject(string $id): void
    {
        Auth::requireAdmin();
        Credit::reject((int) $id);
        Security::jsonResponse(['success' => true, 'message' => 'Demande refusée.']);
    }

   

    private function formatSummary(array $c): array
    {
        return [
            'id' => $c['id'],
            'reference' => 'CR-' . str_pad((string) $c['id'], 4, '0', STR_PAD_LEFT),
            'status' => $this->mapStatus($c['statut']),
            'amount' => (float) ($c['montant_accorde'] ?? $c['montant_demande']),
            'durationMonths' => (int) $c['duree_mois'],
            'createdAt' => date('d/m/Y', strtotime($c['date_demande'])),
            'amountPaid' => Credit::totalRembourse((int) $c['id']),
        ];
    }

    // Fait correspondre les statuts base de données aux statuts attendus par le front
    private function mapStatus(string $dbStatus): string
    {
        return match ($dbStatus) {
            'en_attente' => 'pending',
            'approuve' => 'approved',
            'en_cours' => 'repaying',
            'rembourse' => 'completed',
            'refuse' => 'rejected',
            'annule' => 'rejected',
            default => $dbStatus,
        };
    }

    private function buildSchedule(array $credit, array $remboursements): array
    {
        if (!$credit['montant_accorde'] || !$credit['date_approbation']) {
            return [];
        }

        $mensualite = round((float) $credit['montant_accorde'] / (int) $credit['duree_mois'], 2);
        $paidSoFar = 0;
        $schedule = [];

        for ($i = 1; $i <= (int) $credit['duree_mois']; $i++) {
            $dueDate = date('d/m/Y', strtotime($credit['date_approbation'] . " +{$i} months"));
            $amountPaidThisRow = 0;

            if (isset($remboursements[$i - 1])) {
                $amountPaidThisRow = (float) $remboursements[$i - 1]['montant'];
            }

            $schedule[] = [
                'id' => $i,
                'dueDate' => $dueDate,
                'amountDue' => $mensualite,
                'amountPaid' => $amountPaidThisRow,
                'status' => $amountPaidThisRow > 0 ? 'paid' : 'pending',
            ];
        }

        return $schedule;
    }
}
