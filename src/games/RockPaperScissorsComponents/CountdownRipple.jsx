export function CountdownRipple({ count }) {
  return (
    <div className="rps-countdown">
      <span key={count} className="rps-countdown-num">{count}</span>
    </div>
  )
}
