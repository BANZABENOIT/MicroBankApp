import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ClientLayout from "../components/ClientLayout";
import Modal from "../components/Modal";
import { fetchMyCredits, requestCredit } from "../redux/slices/creditSlice";
import "./Credits.css";

const STATUS_LABELS = {
  pending: "En attente",
  approved: "En cours",
  repaying: "En cours",
  completed: "Terminé",
  rejected: "Refusé",
};

function Credits() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector((state) => state.credits);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: "", duration_months: "", reason: "" });

  useEffect(() => {
    dispatch(fetchMyCredits());
  }, [dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      requestCredit({
        amount: Number(form.amount),
        duration_months: Number(form.duration_months),
        reason: form.reason,
      })
    );

    if (requestCredit.fulfilled.match(result)) {
      toast.success("Demande de crédit envoyée !");
      setForm({ amount: "", duration_months: "", reason: "" });
      setShowForm(false);
      dispatch(fetchMyCredits());
    } else {
      toast.error(result.payload);
    }
  };

  return (
    <ClientLayout title="Mes crédits" subtitle="Liste de vos crédits">
      <div className="credits-list">
        {items.map((credit) => {
          const paid = credit.amountPaid || 0;
          const percent = Math.round((paid / credit.amount) * 100) || 0;
          const isActive = credit.status === "approved" || credit.status === "repaying";

          return (
            <div className="c-card credit-row" key={credit.id}>
              <div className="credit-row-top">
                <strong className="credit-ref">{credit.reference}</strong>
                <span className={`c-badge status-${credit.status}`}>
                  {STATUS_LABELS[credit.status] || credit.statut}
                </span>
              </div>

              <div className="credit-row-fields">
                <div>
                  <span className="request-label">Montant</span>
                  <p>{credit.amountRequest?.toLocaleString("fr-FR")} BIF</p>
                </div>
                <div>
                  <span className="request-label">Durée</span>
                  <p>{credit.durationMonths} mois</p>
                </div>
                <div>
                  <span className="request-label">
                    {isActive ? "Date accord" : "Date demande"}
                  </span>
                  <p>{credit.createdAt}</p>
                </div>
                <div>
                  <span className="request-label">
                    {credit.status === "pending" ? "Statut" : "Reste à payer"}
                  </span>
                  <p>
                    {credit.status === "pending"
                      ? "En attente"
                      : `${(credit.amount - paid).toLocaleString("fr-FR")} BIF`}
                  </p>
                </div>
              </div>

              {isActive && (
                <>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${percent}%` }} />
                  </div>
                  <p className="progress-label">
                    Déjà remboursé : {paid.toLocaleString("fr-FR")} BIF ({percent}%)
                  </p>
                </>
              )}

              <button className="c-link" onClick={() => navigate(`/credits/${credit.id}`)}>
                Voir détails →
              </button>
            </div>
          );
        })}
        {!loading && items.length === 0 && <p>Tu n'as encore aucun crédit.</p>}
      </div>

      <button className="c-btn c-btn-primary credits-new-btn" onClick={() => setShowForm(true)}>
        Demander un nouveau crédit
      </button>

      {showForm && (
        <Modal title="Demander un nouveau crédit" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="credit-request-form">
            <label>Montant souhaité (BIF) *</label>
            <input type="number" name="amount" value={form.amount} onChange={handleChange} required />

            <label>Durée (mois) *</label>
            <input type="number" name="duration_months" value={form.duration_months} onChange={handleChange} required />

            <label>Motif de la demande</label>
            <textarea name="reason" rows={3} value={form.reason} onChange={handleChange} />

            <div className="credit-form-note">
              <strong>Informations importantes</strong>
              <ul>
                <li>Vérifie bien toutes les informations avant d'envoyer.</li>
                <li>Les demandes incomplètes peuvent être rejetées.</li>
                <li>Tu seras notifié de la décision par email ou SMS.</li>
              </ul>
            </div>

            <button type="submit" className="c-btn c-btn-primary">
              Envoyer la demande
            </button>
          </form>
        </Modal>
      )}
    </ClientLayout>
  );
}

export default Credits;
