import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  FiGrid,
  FiUser,
  FiFileText,
  FiPieChart,
  FiCreditCard,
  FiList,
  FiRepeat,
  FiLogOut,
} from "react-icons/fi";
import { logout } from "../redux/slices/authSlice";
import "./Sidebar.css";

const links = [
  { to: "/dashboard", label: "Tableau de bord", icon: <FiGrid /> },
  { to: "/profile", label: "Mon profil", icon: <FiUser /> },
  { to: "/credits", label: "Mes crédits", icon: <FiFileText /> },
  { to: "/savings", label: "Mon épargne", icon: <FiPieChart /> },
  { to: "/accounts", label: "Mes comptes", icon: <FiCreditCard /> },
  { to: "/transactions", label: "Mes transactions", icon: <FiList /> },
  { to: "/repayments", label: "Mes remboursements", icon: <FiRepeat /> },
];

function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <aside className="c-sidebar">
      <div className="c-sidebar-brand">
        <span className="c-sidebar-logo">FA</span>
        FinAccess
      </div>
      <p className="c-sidebar-section-label">Espace client</p>

      <nav className="c-sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => "c-sidebar-link" + (isActive ? " active" : "")}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="c-sidebar-logout" onClick={handleLogout}>
        <FiLogOut />
        <span>Déconnexion</span>
      </button>
    </aside>
  );
}

export default Sidebar;
