export default function StatChip({ label, value, color, badge }) {
  return (
    <div className="stat-chip" style={{ '--cc': color }}>
      <span className="stat-chip-label">{label}</span>
      <span className="stat-chip-val">{badge && <span>{badge}</span>}{value}</span>
    </div>
  )
}
