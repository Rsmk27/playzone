export function ScoreBox({ label, value, color }) {
  return (
    <div className="rps-score-box" style={{ '--scolor': color }}>
      <span className="rps-score-label">{label}</span>
      <span className="rps-score-value">{value}</span>
    </div>
  )
}
