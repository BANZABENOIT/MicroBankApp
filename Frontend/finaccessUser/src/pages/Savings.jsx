import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiPieChart } from "react-icons/fi";
import ClientLayout from "../components/ClientLayout";
import { fetchSavings } from "../redux/slices/savingsSlice";
import "./Savings.css";

function Savings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { balance, history, loading } = useSelector((state) => state.savings);

  useEffect(() => {
    dispatch(fetchSavings());
  }, [dispatch]);

  const visibleHistory = history.slice(0, 5);

  return (
    <ClientLayout title="Mon épargne" subtitle="Suivez l'évolution de votre épargne">
      <div className="c-card savings-balance-card">
        <div>
          <p className="request-label">Solde actuel</p>
          <h2>{balance?.toLocaleString("fr-FR")} BIF</h2>
        </div>
        <FiPieChart size={40} color="var(--c-accent)" />
      </div>

      <div className="c-card">
        <h3>Historique de l'épargne</h3>
        <ul className="savings-history-list">
          {visibleHistory.map((item) => (
            <li key={item.id}>
              <div>
                <span className="tx-date-inline">{item.date}</span>
                <span className="tx-label">{item.type === "deposit" ? "Dépôt" : "Retrait"}</span>
              </div>
              <span className={item.amount >= 0 ? "tx-amount-positive" : "tx-amount-negative"}>
                {item.amount >= 0 ? "+" : ""}
                {item.amount?.toLocaleString("fr-FR")} BIF
              </span>
            </li>
          ))}
          {!loading && visibleHistory.length === 0 && (
            <p className="dashboard-empty">Aucune opération d'épargne.</p>
          )}
        </ul>

        {history.length > 0 && (
          <button className="c-link" onClick={() => navigate("/transactions")}>
            Voir toutes les opérations →
          </button>
        )}
      </div>
    </ClientLayout>
  );
}

export default Savings;
