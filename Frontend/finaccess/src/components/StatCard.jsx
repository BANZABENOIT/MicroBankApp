import "./StatCard.css";

function StatCard({ icon, label, value, delta, iconColor, linkLabel, onLinkClick }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ backgroundColor: iconColor }}>
        {icon}
      </div>
      <p className="stat-card-label">{label}</p>
      <h2 className="stat-card-value">{value}</h2>
      {delta && <p className="stat-card-delta">{delta}</p>}
      {linkLabel && (
        <button className="stat-card-link" onClick={onLinkClick}>
          {linkLabel} →
        </button>
      )}
    </div>
  );
}

export default StatCard;
