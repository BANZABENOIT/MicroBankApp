import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FiArrowDownLeft, FiArrowUpRight, FiRefreshCw } from "react-icons/fi";
import AdminLayout from "../components/AdminLayout";
import { fetchAccounts } from "../redux/slices/accountSlice";
import {
  depositToAccount,
  fetchBank,
  injectCapital,
  withdrawFromAccount,
} from "../redux/slices/bankSlice";
import "./Bank.css";

const labels = {
  depot: "Dépôt client",
  retrait: "Retrait client",
  decaissement_credit: "Décaissement de crédit",
  remboursement: "Remboursement reçu",
  capital_initial: "Capital initial",
};

function Bank() {
  const dispatch = useDispatch();
  const { items: accounts } = useSelector((state) => state.accounts);
  const { summary, movements, loading, operating, error } = useSelector(
    (state) => state.bank,
  );
  const [form, setForm] = useState({
    accountId: "",
    amount: "",
    fee: "",
    type: "deposit",
  });

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchBank());
  }, [dispatch]);

  const submit = async (event) => {
    event.preventDefault();
    const payload = { amount: Number(form.amount) };
    const action =
      form.type === "capital"
        ? injectCapital
        : form.type === "deposit"
          ? depositToAccount
          : withdrawFromAccount;
    if (form.type !== "capital") payload.accountId = Number(form.accountId);
    if (form.type === "withdraw") payload.fee = Number(form.fee || 0);

    const result = await dispatch(action(payload));
    if (action.fulfilled.match(result)) {
      toast.success(
        form.type === "capital"
          ? "Capital injecté."
          : form.type === "deposit"
            ? "Dépôt effectué."
            : "Retrait effectué.",
      );
      setForm((current) => ({ ...current, amount: "", fee: "" }));
      dispatch(fetchBank());
      dispatch(fetchAccounts());
    } else {
      toast.error(result.payload);
    }
  };

  return (
    <AdminLayout
      title="Banque"
      subtitle="Gérez le capital global et les opérations au guichet"
    >
      <section className="bank-summary admin-card">
        <div>
          <span className="bank-eyebrow">Solde global disponible</span>
          <strong>{(summary?.balance || 0).toLocaleString("fr-FR")} BIF</strong>
          <small>
            {summary?.updatedAt
              ? `Mis à jour le ${new Date(summary.updatedAt).toLocaleString("fr-FR")}`
              : "Compte bancaire initialisé"}
          </small>
          <small
            className={
              summary?.invariantDifference === 0
                ? "bank-invariant-ok"
                : "bank-invariant-warning"
            }
          >
            Écart comptable :{" "}
            {(summary?.invariantDifference || 0).toLocaleString("fr-FR")} BIF
          </small>
        </div>
        <FiRefreshCw
          className={loading ? "bank-refresh spinning" : "bank-refresh"}
        />
      </section>

      <section className="bank-grid">
        <form className="admin-card bank-form" onSubmit={submit}>
          <div className="bank-card-heading">
            <div>
              <h2>Opération au guichet</h2>
              <p>Seul un administrateur peut modifier le solde client.</p>
            </div>
          </div>

          <label>
            Type d’opération
            <select
              value={form.type}
              onChange={(event) =>
                setForm({ ...form, type: event.target.value })
              }
            >
              <option value="capital">Capital initial</option>
              <option value="deposit">Dépôt client</option>
              <option value="withdraw">Retrait client</option>
            </select>
          </label>
          {form.type !== "capital" && (
            <label>
              Compte client
              <select
                required
                value={form.accountId}
                onChange={(event) =>
                  setForm({ ...form, accountId: event.target.value })
                }
              >
                <option value="">Sélectionner un compte</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.reference} - {account.clientName} (
                    {account.balance?.toLocaleString("fr-FR")} BIF)
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            Montant (BIF)
            <input
              min="0.01"
              step="0.01"
              required
              type="number"
              value={form.amount}
              onChange={(event) =>
                setForm({ ...form, amount: event.target.value })
              }
            />
          </label>
          {form.type === "withdraw" && (
            <label>
              Frais de retrait (BIF)
              <input
                min="0"
                step="0.01"
                type="number"
                value={form.fee}
                onChange={(event) =>
                  setForm({ ...form, fee: event.target.value })
                }
              />
            </label>
          )}
          <button
            className="admin-btn admin-btn-primary"
            disabled={operating}
            type="submit"
          >
            {form.type === "deposit" ? <FiArrowDownLeft /> : <FiArrowUpRight />}
            {operating
              ? "Traitement..."
              : form.type === "capital"
                ? "Injecter le capital"
                : form.type === "deposit"
                  ? "Effectuer le dépôt"
                  : "Effectuer le retrait"}
          </button>
          {error && <p className="bank-error">{error}</p>}
        </form>

        <div className="admin-card bank-history">
          <div className="bank-card-heading">
            <div>
              <h2>Historique banque</h2>
              <p>Les mouvements ayant une contrepartie client.</p>
            </div>
          </div>
          <div className="bank-history-list">
            {movements.map((movement) => (
              <div className="bank-history-row" key={movement.id}>
                <div>
                  <strong>{labels[movement.type] || movement.type}</strong>
                  <small>
                    {movement.clientName || "Plateforme"} ·{" "}
                    {new Date(movement.createdAt).toLocaleString("fr-FR")}
                  </small>
                </div>
                <span
                  className={
                    movement.type === "depot" ||
                    movement.type === "decaissement_credit"
                      ? "bank-out"
                      : "bank-in"
                  }
                >
                  {movement.type === "depot" ||
                  movement.type === "decaissement_credit"
                    ? "-"
                    : "+"}
                  {movement.amount.toLocaleString("fr-FR")} BIF
                </span>
              </div>
            ))}
            {!loading && movements.length === 0 && (
              <p className="table-empty">Aucun mouvement bancaire.</p>
            )}
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}

export default Bank;
