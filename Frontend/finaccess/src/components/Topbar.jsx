import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiBell, FiLogOut } from "react-icons/fi";
import { logout } from "../redux/slices/authSlice";
import "./Topbar.css";

function Topbar({ title, subtitle }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
      </div>

      <div className="topbar-actions">
        <div className="topbar-search">
          <FiSearch />
          <input type="text" placeholder="Rechercher..." />
        </div>

        <button className="topbar-icon-btn">
          <FiBell />
        </button>

        <div className="topbar-profile">
          <div className="topbar-avatar">{user?.name?.charAt(0) || "A"}</div>
          <div>
            <div className="topbar-profile-name">{user?.name || "Admin FinAccess"}</div>
            <div className="topbar-profile-role">Administrateur</div>
          </div>
        </div>

        <button className="topbar-icon-btn" onClick={handleLogout} title="Déconnexion">
          <FiLogOut />
        </button>
      </div>
    </header>
  );
}

export default Topbar;
