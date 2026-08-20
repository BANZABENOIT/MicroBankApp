import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ClientLayout from "../components/ClientLayout";
import StatCard from "../components/StatCard";
import DonutChart from "../components/DonutChart";
import { fetchClientDashboard } from "../redux/slices/dashboardSlice";
import "./Dashboard.css";

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const {
    totalBalance,
    activeCreditsAmount,
    totalSavings,
    upcomingPayments,
    creditsOverview,
    recentTransactions,
    loading,
  } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchClientDashboard());
  }, [dispatch]);

  const totalCredits = creditsOverview.inProgress + creditsOverview.completed + creditsOverview.pending;

  return (
    <ClientLayout title={`Bonjour, ${user?.name || ""} `} subtitle="Voici un résumé de votre activité">
      <div className="stats-row">
        <StatCard
          colorClass="blue"
          label="Solde total"
          value={`${totalBalance?.toLocaleString("fr-FR") || 0} BIF`}
          linkLabel="Voir détails"
          onLinkClick={() => navigate("/accounts")}
        />
        <StatCard
          colorClass="purple"
          label="Crédits en cours"
          value={`${activeCreditsAmount?.toLocaleString("fr-FR") || 0} BIF`}
          linkLabel="Voir détails"
          onLinkClick={() => navigate("/credits")}
        />
        <StatCard
          colorClass="green"
          label="Épargne totale"
          value={`${totalSavings?.toLocaleString("fr-FR") || 0} BIF`}
          linkLabel="Voir détails"
          onLinkClick={() => navigate("/savings")}
        />
        <StatCard
          colorClass="amber"
          label="Paiements à venir"
          value={`${upcomingPayments?.toLocaleString("fr-FR") || 0} BIF`}
          linkLabel="Voir détails"
          onLinkClick={() => navigate("/repayments")}
        />
      </div>

      <div className="dashboard-grid">
        <div className="c-card">
          <h3>Aperçu de mes crédits</h3>
          <DonutChart
            centerValue={totalCredits}
            centerLabel="Crédits"
            segments={[
              { label: "En cours", value: creditsOverview.inProgress, color: "#2f6fed" },
              { label: "Terminé", value: creditsOverview.completed, color: "#16a34a" },
              { label: "En attente", value: creditsOverview.pending, color: "#d97706" },
            ]}
          />
          <button className="c-link" style={{ marginTop: "1rem" }} onClick={() => navigate("/credits")}>
            Voir tous mes crédits →
          </button>
        </div>

        <div className="c-card">
          <h3>Dernières transactions</h3>
          <ul className="tx-list">
            {recentTransactions.map((tx) => (
              <li key={tx.id}>
                <div>
                  <span className="tx-date">{tx.date}</span>
                  <span className="tx-label">{tx.label}</span>
                </div>
                <span className={tx.amount >= 0 ? "tx-amount-positive" : "tx-amount-negative"}>
                  {tx.amount >= 0 ? "+" : ""}
                  {tx.amount?.toLocaleString("fr-FR")} BIF
                </span>
              </li>
            ))}
            {!loading && recentTransactions.length === 0 && (
              <p className="dashboard-empty">Aucune transaction récente.</p>
            )}
          </ul>
          <button className="c-link" onClick={() => navigate("/transactions")}>
            Voir toutes mes transactions →
          </button>
        </div>
      </div>

      <div className="c-card cta-card">
        <div>
          <strong>Besoin d'un crédit ?</strong>
          <p>Demandez un nouveau crédit en quelques minutes.</p>
        </div>
        <button className="c-btn c-btn-primary" onClick={() => navigate("/credits")}>
          Demander un crédit
        </button>
      </div>
    </ClientLayout>
  );
}

export default Dashboard;
