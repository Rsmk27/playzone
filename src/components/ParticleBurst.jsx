import { useState } from 'react'

function Particle({ x, y, color }) {
  const angle  = Math.random() * 360
  const speed  = 60 + Math.random() * 80
  const dx     = Math.cos((angle * Math.PI) / 180) * speed
  const dy     = Math.sin((angle * Math.PI) / 180) * speed
  const size   = 6 + Math.random() * 8
  const shapes = ['●', '★', '◆', '▲', '♥', '✦', '✸']
  const shape  = shapes[Math.floor(Math.random() * shapes.length)]

  return (
    <span
      style={{
        position: 'fixed',
        left: x,
        top: y,
        fontSize: size,
        color,
        pointerEvents: 'none',
        zIndex: 9999,
        animation: `shared-particle 0.9s ease-out forwards`,
        '--dx': `${dx}px`,
        '--dy': `${dy}px`,
      }}
    >
      {shape}
    </span>
  )
}

export function ParticleBurst({ x, y, color, id }) {
  const [particles] = useState(() =>
    Array.from({ length: 22 }, (_, i) => i)
  )
  return (
    <>
      <style>{`
        @keyframes shared-particle {
          0%   { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
        }
      `}</style>
      {particles.map(i => (
        <Particle key={`${id || ''}-${i}`} x={x} y={y} color={color} />
      ))}
    </>
  )
}

export default ParticleBurst;
