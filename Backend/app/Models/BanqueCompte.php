<?php

namespace App\Models;

use App\Core\Database;
use PDO;
use RuntimeException;

class BanqueCompte
{
    public static function summary(): array
    {
        $pdo = Database::connect();
        self::ensureAccount($pdo);
        $row = $pdo->query('SELECT id, solde, updated_at FROM banque_compte WHERE id = 1')->fetch();
        $clientBalance = (float) $pdo->query('SELECT COALESCE(SUM(solde), 0) FROM comptes')->fetchColumn();
        $capitalInitial = (float) $pdo->query("SELECT COALESCE(SUM(montant), 0) FROM banque_mouvements WHERE type = 'capital_initial'")->fetchColumn();
        $difference = $capitalInitial - ((float) $row['solde'] + $clientBalance);

        return [
            'id' => (int) $row['id'],
            'balance' => (float) $row['solde'],
            'clientBalance' => $clientBalance,
            'capitalInitial' => $capitalInitial,
            'invariantDifference' => round($difference, 2),
            'updatedAt' => $row['updated_at'],
        ];
    }

    public static function injectCapital(float $amount, int $adminId): void
    {
        self::assertPositive($amount);
        $pdo = Database::connect();
        $pdo->beginTransaction();

        try {
            self::ensureAccount($pdo);
            self::updateBank($pdo, $amount);
            self::recordBankMovement($pdo, 'capital_initial', $amount, 0.0, 0, null, $adminId);
            $pdo->commit();
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }
    }

    public static function history(int $limit = 200): array
    {
        $pdo = Database::connect();
        self::ensureAccount($pdo);
        $stmt = $pdo->prepare(
            'SELECT bm.*, CONCAT(u.prenom, " ", u.nom) AS operator_name,
					CONCAT(cu.prenom, " ", cu.nom) AS client_name
			 FROM banque_mouvements bm
			 LEFT JOIN utilisateurs u ON u.id = bm.effectue_par
			 LEFT JOIN clients c ON c.id = bm.client_id
			 LEFT JOIN utilisateurs cu ON cu.id = c.utilisateur_id
			 ORDER BY bm.created_at DESC, bm.id DESC LIMIT ' . (int) $limit
        );
        $stmt->execute();

        return array_map(static fn(array $row): array => [
            'id' => (int) $row['id'],
            'type' => $row['type'],
            'amount' => (float) $row['montant'],
            'fee' => (float) $row['frais'],
            'clientName' => $row['client_name'],
            'operatorName' => $row['operator_name'],
            'reference' => $row['reference_operation'],
            'createdAt' => $row['created_at'],
        ], $stmt->fetchAll());
    }

    public static function deposit(int $accountId, float $amount, int $adminId): void
    {
        self::clientOperation($accountId, $amount, 0.0, $adminId, 'depot', 1, 'Dépôt effectué par un admin');
    }

    public static function withdraw(int $accountId, float $amount, float $fee, int $adminId): void
    {
        self::clientOperation($accountId, $amount, $fee, $adminId, 'retrait', -1, 'Retrait effectué par un admin');
    }

    public static function disburseCredit(
        int $creditId,
        int $accountId,
        float $amount,
        float $interestRate,
        int $durationMonths,
        int $adminId
    ): void {
        self::assertPositive($amount);
        $pdo = Database::connect();
        $pdo->beginTransaction();

        try {
            self::ensureAccount($pdo);
            $credit = self::lockRow($pdo, 'SELECT * FROM credits WHERE id = ?', $creditId);
            if (!$credit || $credit['statut'] !== 'en_attente' || (int) $credit['compte_id'] !== $accountId) {
                throw new RuntimeException('Cette demande de crédit ne peut pas être approuvée.');
            }

            $account = self::lockRow($pdo, 'SELECT * FROM comptes WHERE id = ?', $accountId);
            $bank = self::lockRow($pdo, 'SELECT * FROM banque_compte WHERE id = ?', 1);
            self::assertAccount($account);
            self::assertBankAccount($bank);
            self::assertBankFunds((float) $bank['solde'], $amount);

            $dueDate = date('Y-m-d H:i:s', strtotime('+' . (int) $durationMonths . ' months'));
            $pdo->prepare(
                'UPDATE credits SET statut = "approuve", montant_accorde = ?, taux_interet = ?,
				 date_approbation = NOW(), date_echeance = ? WHERE id = ?'
            )->execute([$amount, $interestRate, $dueDate, $creditId]);
            $pdo->prepare('UPDATE comptes SET solde = solde + ? WHERE id = ?')->execute([$amount, $accountId]);
            self::updateBank($pdo, -$amount);
            self::recordClientTransaction($pdo, $accountId, 'credit', $amount, (float) $account['solde'], (float) $account['solde'] + $amount, 'Prêt accordé');
            self::recordBankMovement($pdo, 'decaissement_credit', $amount, 0.0, (int) $credit['client_id'], $creditId, $adminId);
            $pdo->commit();
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }
    }

    public static function recordRepayment(
        int $creditId,
        int $accountId,
        float $amount,
        string $paymentDate,
        string $paymentMethod,
        int $operatorId
    ): void {
        self::assertPositive($amount);
        $pdo = Database::connect();
        $pdo->beginTransaction();

        try {
            self::ensureAccount($pdo);
            $credit = self::lockRow($pdo, 'SELECT * FROM credits WHERE id = ?', $creditId);
            if (!$credit || (int) $credit['compte_id'] !== $accountId || !in_array($credit['statut'], ['approuve', 'en_cours'], true)) {
                throw new RuntimeException('Ce crédit ne peut pas recevoir de remboursement.');
            }
            $account = self::lockRow($pdo, 'SELECT * FROM comptes WHERE id = ?', $accountId);
            self::assertAccount($account);
            if ((float) $account['solde'] < $amount) {
                throw new RuntimeException('Solde insuffisant sur le compte client.');
            }

            $stmt = $pdo->prepare('SELECT COALESCE(SUM(montant), 0) FROM remboursements WHERE credit_id = ?');
            $stmt->execute([$creditId]);
            $totalPaid = (float) $stmt->fetchColumn();
            $principal = (float) ($credit['montant_accorde'] ?? $credit['montant_demande']);
            if ($totalPaid + $amount > $principal) {
                throw new RuntimeException('Le remboursement dépasse le montant restant du crédit.');
            }

            $reference = 'RB-' . strtoupper(bin2hex(random_bytes(4)));
            $pdo->prepare(
                'INSERT INTO remboursements (credit_id, montant, date_remboursement, mode_paiement, reference) VALUES (?, ?, ?, ?, ?)'
            )->execute([$creditId, $amount, $paymentDate, $paymentMethod, $reference]);
            $pdo->prepare('UPDATE comptes SET solde = solde - ? WHERE id = ?')->execute([$amount, $accountId]);
            self::updateBank($pdo, $amount);
            self::recordClientTransaction($pdo, $accountId, 'remboursement', $amount, (float) $account['solde'], (float) $account['solde'] - $amount, 'Remboursement crédit');
            self::recordBankMovement($pdo, 'remboursement', $amount, 0.0, (int) $credit['client_id'], $creditId, $operatorId);
            $newStatus = $totalPaid + $amount >= $principal ? 'rembourse' : 'en_cours';
            $pdo->prepare('UPDATE credits SET statut = ? WHERE id = ?')->execute([$newStatus, $creditId]);
            $pdo->commit();
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }
    }

    private static function clientOperation(int $accountId, float $amount, float $fee, int $adminId, string $type, int $clientDirection, string $description): void
    {
        self::assertPositive($amount);
        if ($fee < 0) {
            throw new RuntimeException('Les frais sont invalides.');
        }
        $pdo = Database::connect();
        $pdo->beginTransaction();

        try {
            self::ensureAccount($pdo);
            $account = self::lockRow($pdo, 'SELECT * FROM comptes WHERE id = ?', $accountId);
            self::assertAccount($account);
            $bank = self::lockRow($pdo, 'SELECT * FROM banque_compte WHERE id = ?', 1);
            self::assertBankAccount($bank);
            $before = (float) $account['solde'];
            $after = $before + ($clientDirection * $amount);
            if ($after < 0) {
                throw new RuntimeException('Solde insuffisant sur le compte client.');
            }
            $bankDelta = $type === 'depot' ? -$amount : $amount + $fee;
            if ($bankDelta < 0) {
                self::assertBankFunds((float) $bank['solde'], -$bankDelta);
            }
            $pdo->prepare('UPDATE comptes SET solde = ? WHERE id = ?')->execute([$after, $accountId]);
            self::updateBank($pdo, $bankDelta);
            self::recordClientTransaction($pdo, $accountId, 'epargne', $amount, $before, $after, $description);
            self::recordBankMovement($pdo, $type, $amount, $fee, (int) $account['client_id'], null, $adminId);
            $pdo->commit();
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }
    }

    private static function ensureAccount(PDO $pdo): void
    {
        $startedTransaction = !$pdo->inTransaction();
        if ($startedTransaction) {
            $pdo->beginTransaction();
        }

        try {
            $rows = $pdo->query('SELECT id, solde FROM banque_compte ORDER BY id FOR UPDATE')->fetchAll();

            if (!$rows) {
                $pdo->exec('INSERT INTO banque_compte (id, solde) VALUES (1, 0.00)');
            } else {
                $balance = array_sum(array_map(static fn(array $row): float => (float) $row['solde'], $rows));
                $hasPrimary = (int) $rows[0]['id'] === 1;

                if ($hasPrimary) {
                    $pdo->prepare('UPDATE banque_compte SET solde = ? WHERE id = 1')->execute([$balance]);
                } else {
                    $pdo->prepare('INSERT INTO banque_compte (id, solde) VALUES (1, ?)')->execute([$balance]);
                }

                $pdo->exec('DELETE FROM banque_compte WHERE id <> 1');
            }

            if ($startedTransaction) {
                $pdo->commit();
            }
        } catch (\Throwable $e) {
            if ($startedTransaction && $pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }
    }

    private static function lockRow(PDO $pdo, string $query, int $id): ?array
    {
        $stmt = $pdo->prepare($query . ' FOR UPDATE');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    private static function assertAccount(?array $account): void
    {
        if (!$account || $account['statut'] !== 'actif') {
            throw new RuntimeException('Compte client introuvable ou inactif.');
        }
    }

    private static function assertPositive(float $amount): void
    {
        if ($amount <= 0) {
            throw new RuntimeException('Le montant doit être positif.');
        }
    }

    private static function assertBankFunds(float $balance, float $amount): void
    {
        if ($balance < $amount) {
            throw new RuntimeException('Solde bancaire insuffisant pour cette opération.');
        }
    }

    private static function assertBankAccount(?array $bank): void
    {
        if (!$bank) {
            throw new RuntimeException('Compte bancaire global introuvable.');
        }
    }

    private static function updateBank(PDO $pdo, float $delta): void
    {
        $pdo->prepare('UPDATE banque_compte SET solde = solde + ? WHERE id = 1')->execute([$delta]);
    }

    private static function recordClientTransaction(PDO $pdo, int $accountId, string $type, float $amount, float $before, float $after, string $description): void
    {
        $pdo->prepare(
            'INSERT INTO transactions (compte_id, type_transaction, montant, solde_avant, solde_apres, description) VALUES (?, ?, ?, ?, ?, ?)'
        )->execute([$accountId, $type, $amount, $before, $after, $description]);
    }

    private static function recordBankMovement(PDO $pdo, string $type, float $amount, float $fee, int $clientId, ?int $creditId, int $adminId): void
    {
        $pdo->prepare(
            'INSERT INTO banque_mouvements (type, montant, frais, client_id, credit_id, effectue_par, reference_operation) VALUES (?, ?, ?, ?, ?, ?, ?)'
        )->execute([$type, $amount, $fee, $clientId > 0 ? $clientId : null, $creditId, $adminId, 'FA-OP-' . strtoupper(bin2hex(random_bytes(6)))]);
    }
}
