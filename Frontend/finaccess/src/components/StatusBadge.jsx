import "./StatusBadge.css";

const STATUS_MAP = {
  active: { label: "Actif", className: "badge-active" },
  actif: { label: "Actif", className: "badge-active" },
  inactive: { label: "Inactif", className: "badge-inactive" },
  inactif: { label: "Inactif", className: "badge-inactive" },
  blocked: { label: "Bloqué", className: "badge-blocked" },
  bloqué: { label: "Bloqué", className: "badge-blocked" },
  pending: { label: "En attente", className: "badge-pending" },
  approved: { label: "Approuvée", className: "badge-approved" },
  rejected: { label: "Refusée", className: "badge-rejected" },
  in_progress: { label: "En cours", className: "badge-progress" },
};

function StatusBadge({ status }) {
  const config = STATUS_MAP[status] || { label: status, className: "badge-default" };

  return <span className={`status-badge ${config.className}`}>{config.label}</span>;
}

export default StatusBadge;
