import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiHome, FiFileText, FiClock } from "react-icons/fi";
import AdminLayout from "../components/AdminLayout";
import StatCard from "../components/StatCard";
import SimpleLineChart from "../components/SimpleLineChart";
import { fetchDashboard } from "../redux/slices/dashboardSlice";
import "./Dashboard.css";

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { stats, chart, activities, loading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  return (
    <AdminLayout title="Tableau de bord" subtitle="Vue d'ensemble de l'activité de FinAccess">
      <div className="stats-row">
        <StatCard
          icon={<FiUsers color="#2563eb" />}
          iconColor="#eff6ff"
          label="Clients"
          value={stats.clients}
          linkLabel="Voir tous les clients"
          onLinkClick={() => navigate("/clients")}
        />
        <StatCard
          icon={<FiHome color="#16a34a" />}
          iconColor="#f0fdf4"
          label="Comptes actifs"
          value={stats.activeAccounts}
          linkLabel="Voir tous les comptes"
          onLinkClick={() => navigate("/accounts")}
        />
        <StatCard
          icon={<FiFileText color="#7c3aed" />}
          iconColor="#f5f3ff"
          label="Crédits en cours"
          value={stats.activeLoans}
          linkLabel="Voir tous les crédits"
          onLinkClick={() => navigate("/credit-requests")}
        />
        <StatCard
          icon={<FiClock color="#d97706" />}
          iconColor="#fffbeb"
          label="Demandes en attente"
          value={stats.pendingRequests}
          linkLabel="Voir les demandes"
          onLinkClick={() => navigate("/credit-requests")}
        />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-panel">
          <h3>Évolution des crédits</h3>
          {chart.labels?.length > 0 ? (
            <SimpleLineChart
              labels={chart.labels}
              series={[
                { name: "Accordés", color: "#2563eb", values: chart.granted },
                { name: "Remboursés", color: "#16a34a", values: chart.repaid },
              ]}
            />
          ) : (
            <p className="dashboard-empty">
              {loading ? "Chargement..." : "Aucune donnée disponible pour l'instant."}
            </p>
          )}
        </div>

        <div className="dashboard-panel">
          <h3>Activités récentes</h3>
          <ul className="activity-list">
            {activities.map((activity) => (
              <li key={activity.id}>
                <span className="activity-message">{activity.message}</span>
                <span className="activity-time">{activity.time}</span>
              </li>
            ))}
            {activities.length === 0 && !loading && (
              <p className="dashboard-empty">Aucune activité récente.</p>
            )}
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Dashboard;
