import "./SimpleLineChart.css";

function SimpleLineChart({ series, labels, height = 220 }) {
  const width = 600;
  const padding = 30;

  const allValues = series.flatMap((s) => s.values);
  const maxValue = Math.max(...allValues, 1);

  const stepX = (width - padding * 2) / (labels.length - 1 || 1);

  const toPoints = (values) =>
    values
      .map((v, i) => {
        const x = padding + i * stepX;
        const y = height - padding - (v / maxValue) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(" ");

  return (
    <div className="chart-wrapper">
      <div className="chart-legend">
        {series.map((s) => (
          <div key={s.name} className="chart-legend-item">
            <span
              className="chart-dot"
              style={{ backgroundColor: s.color }}
            ></span>
            {s.name}
          </div>
        ))}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1={padding}
            x2={width - padding}
            y1={height - padding - ratio * (height - padding * 2)}
            y2={height - padding - ratio * (height - padding * 2)}
            stroke="#f1f5f9"
          />
        ))}

        {series.map((s) => (
          <g key={s.name}>
            <polyline
              points={toPoints(s.values)}
              fill="none"
              stroke={s.color}
              strokeWidth="2.5"
            />
            {s.values.map((v, i) => {
              const x = padding + i * stepX;
              const y =
                height - padding - (v / maxValue) * (height - padding * 2);
              return <circle key={i} cx={x} cy={y} r="4" fill={s.color} />;
            })}
          </g>
        ))}

        {labels.map((label, i) => (
          <text
            key={label}
            x={padding + i * stepX}
            y={height - 5}
            fontSize="11"
            fill="#6b7280"
            textAnchor="middle"
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default SimpleLineChart;
