export default function StatBox({ label, value, color, prefix = "stat" }) {
  return (
    <div className={prefix} style={{ '--sc': color, '--bc': color }}>
      <span className={`${prefix}-label`}>{label}</span>
      <span className={`${prefix}-val`}>{value}</span>
    </div>
  )
}
