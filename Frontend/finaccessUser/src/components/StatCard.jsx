import "./StatCard.css";

function StatCard({ label, value, colorClass, linkLabel, onLinkClick }) {
  return (
    <div className={`c-stat-card ${colorClass || ""}`}>
      <p className="c-stat-label">{label}</p>
      <h2 className="c-stat-value">{value}</h2>
      {linkLabel && (
        <button className="c-link" onClick={onLinkClick}>
          {linkLabel} →
        </button>
      )}
    </div>
  );
}

export default StatCard;
