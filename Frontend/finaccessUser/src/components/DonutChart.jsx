import "./DonutChart.css";

function DonutChart({ segments, centerValue, centerLabel }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  let offsetAcc = 0;

  return (
    <div className="donut-wrapper">
      <svg viewBox="0 0 160 160" className="donut-svg">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="16" />
        {segments.map((s) => {
          const fraction = s.value / total;
          const dash = fraction * circumference;
          const gap = circumference - dash;
          const circle = (
            <circle
              key={s.label}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth="16"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offsetAcc}
              transform="rotate(-90 80 80)"
              strokeLinecap="round"
            />
          );
          offsetAcc += dash;
          return circle;
        })}
        <text x="80" y="76" textAnchor="middle" className="donut-center-value">
          {centerValue}
        </text>
        <text x="80" y="96" textAnchor="middle" className="donut-center-label">
          {centerLabel}
        </text>
      </svg>

      <div className="donut-legend">
        {segments.map((s) => (
          <div key={s.label} className="donut-legend-item">
            <span className="donut-dot" style={{ backgroundColor: s.color }}></span>
            {s.label} <strong>{s.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DonutChart;
