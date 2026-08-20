import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FiSearch } from "react-icons/fi";
import AdminLayout from "../components/AdminLayout";
import StatusBadge from "../components/StatusBadge";
import { fetchCreditRequests } from "../redux/slices/creditRequestSlice";
import { recordRepayment } from "../redux/slices/repaymentSlice";
import "./Repayments.css";

function Repayments() {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.creditRequests);
  const { loading } = useSelector((state) => state.repayments);
  const [search, setSearch] = useState("");
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [form, setForm] = useState({
    amountPaid: "",
    paymentMethod: "Mobile Money",
    reference: "",
    paymentDate: "",
    note: "",
  });

  const activeCredits = items.filter((c) =>
    ["approved", "repaying"].includes(c.status)
  );
  const filtered = activeCredits.filter((c) =>
    `${c.clientName} ${c.reference}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  useEffect(() => {
    dispatch(fetchCreditRequests());
  }, [dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCredit) {
      toast.error("Sélectionne un crédit d'abord.");
      return;
    }

    const result = await dispatch(
      recordRepayment({
        creditId: selectedCredit.id,
        amount: Number(form.amountPaid),
        paymentMethod: form.paymentMethod,
        reference: form.reference,
        paymentDate: form.paymentDate,
        note: form.note,
      })
    );

    if (recordRepayment.fulfilled.match(result)) {
      toast.success("Remboursement enregistré.");
      setForm({
        amountPaid: "",
        paymentMethod: "Mobile Money",
        reference: "",
        paymentDate: "",
        note: "",
      });
      setSelectedCredit(null);
      dispatch(fetchCreditRequests());
    } else {
      toast.error(result.payload);
    }
  };

  const amountAlreadyPaid = selectedCredit?.amountPaid || 0;
  const remaining = selectedCredit
    ? selectedCredit.amount - amountAlreadyPaid
    : 0;
  const progressPercent = selectedCredit
    ? Math.round((amountAlreadyPaid / selectedCredit.amount) * 100)
    : 0;

  return (
    <AdminLayout
      title="Remboursements"
      subtitle="Enregistrez un paiement effectué par un client"
    >
      <div className="repayments-grid">
        <div className="admin-card">
          <div className="admin-search" style={{ marginBottom: "1rem" }}>
            <FiSearch />
            <input
              placeholder="Rechercher un crédit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="credit-list">
            {filtered.map((credit) => (
              <div
                key={credit.id}
                className={
                  "credit-item" +
                  (selectedCredit?.id === credit.id ? " selected" : "")
                }
                onClick={() => setSelectedCredit(credit)}
              >
                <div>
                  <strong>{credit.reference}</strong>
                  <p>{credit.clientName}</p>
                </div>
                <StatusBadge status="En cours" />
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="table-empty">Aucun crédit en cours.</p>
            )}
          </div>
        </div>

        <div className="admin-card">
          {!selectedCredit ? (
            <p className="table-empty">
              Sélectionne un crédit dans la liste pour enregistrer un
              remboursement.
            </p>
          ) : (
            <>
              <h4>Informations crédit</h4>
              <div className="credit-summary">
                <div>
                  <span className="request-label">Client</span>
                  <p>{selectedCredit.clientName}</p>
                </div>
                <div>
                  <span className="request-label">Montant du crédit</span>
                  <p>{selectedCredit.amount?.toLocaleString("fr-FR")} BIF</p>
                </div>
                <div>
                  <span className="request-label">Déjà remboursé</span>
                  <p>{amountAlreadyPaid.toLocaleString("fr-FR")} BIF</p>
                </div>
                <div>
                  <span className="request-label">Reste à payer</span>
                  <p>{remaining.toLocaleString("fr-FR")} BIF</p>
                </div>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="progress-label">{progressPercent}% remboursé</p>

              <h4>Informations paiement</h4>
              <form onSubmit={handleSubmit} className="repayment-form">
                <label>Montant payé (BIF) *</label>
                <input
                  type="number"
                  name="amountPaid"
                  value={form.amountPaid}
                  onChange={handleChange}
                  required
                />

                <label>Mode de paiement *</label>
                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                >
                  <option>Mobile Money</option>
                  <option>Espèces</option>
                  <option>Virement bancaire</option>
                </select>

                <label>Référence *</label>
                <input
                  type="text"
                  name="reference"
                  value={form.reference}
                  onChange={handleChange}
                  required
                />

                <label>Date du paiement *</label>
                <input
                  type="date"
                  name="paymentDate"
                  value={form.paymentDate}
                  onChange={handleChange}
                  required
                />

                <label>Observation (facultatif)</label>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  rows={3}
                />

                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={loading}
                >
                  {loading
                    ? "Enregistrement..."
                    : "Enregistrer le remboursement"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default Repayments;
