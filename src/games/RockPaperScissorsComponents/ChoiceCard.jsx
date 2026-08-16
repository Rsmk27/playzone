import { useState, useRef } from 'react';

export function ChoiceCard({ opt, onClick, disabled }) {
  const [pressed, setPressed] = useState(false)
  const ref = useRef(null)

  const handle = () => {
    if (disabled) return
    setPressed(true)
    setTimeout(() => setPressed(false), 300)
    onClick(ref.current?.getBoundingClientRect())
  }

  return (
    <button
      ref={ref}
      className="rps-choice"
      style={{
        '--choice-color': opt.color,
        '--choice-glow':  opt.glow,
        transform: pressed ? 'scale(0.88) translateY(4px)' : '',
      }}
      onClick={handle}
      disabled={disabled}
      title={opt.label}
    >
      <span className="rps-choice-emoji">{opt.emoji}</span>
      <span className="rps-choice-label">{opt.label}</span>
    </button>
  )
}
