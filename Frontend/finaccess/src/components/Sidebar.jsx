import { NavLink } from "react-router-dom";
import {
  FiGrid,
  FiUsers,
  FiFileText,
  FiCreditCard,
  FiRepeat,
  FiList,
  FiBarChart2,
  FiSettings,
} from "react-icons/fi";
import "./Sidebar.css";

const links = [
  { to: "/dashboard", label: "Tableau de bord", icon: <FiGrid /> },
  { to: "/clients", label: "Clients", icon: <FiUsers /> },
  { to: "/credit-requests", label: "Demandes de crédit", icon: <FiFileText /> },
  { to: "/accounts", label: "Comptes", icon: <FiCreditCard /> },
  { to: "/repayments", label: "Remboursements", icon: <FiRepeat /> },
  { to: "/transactions", label: "Transactions", icon: <FiList /> },
  { to: "/reports", label: "Rapports", icon: <FiBarChart2 /> },
  { to: "/settings", label: "Paramètres", icon: <FiSettings /> },
];

function Sidebar({ user }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo">FA</span>
        FinAccess
      </div>
      <p className="sidebar-section-label">Espace administrateur</p>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="sidebar-user-avatar">{user?.name?.charAt(0) || "A"}</div>
        <div>
          <div className="sidebar-user-name">{user?.name || "Admin FinAccess"}</div>
          <div className="sidebar-user-role">Administrateur</div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
