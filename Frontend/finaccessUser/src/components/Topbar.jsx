import { useSelector } from "react-redux";
import { FiBell, FiChevronDown } from "react-icons/fi";
import "./Topbar.css";

function Topbar({ title, subtitle }) {
  const { user } = useSelector((state) => state.auth);

  return (
    <header className="c-topbar">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="c-topbar-subtitle">{subtitle}</p>}
      </div>

      <div className="c-topbar-actions">
        <button className="c-topbar-icon-btn">
          <FiBell />
        </button>
        <div className="c-topbar-profile">
          <div className="c-topbar-avatar">{user?.name?.charAt(0) || "U"}</div>
          <span>{user?.name || "Utilisateur"}</span>
          <FiChevronDown size={14} />
        </div>
      </div>
    </header>
  );
}

export default Topbar;
