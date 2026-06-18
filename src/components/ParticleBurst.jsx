import { useState } from 'react'

const CHARS = ['✦', '★', '◆', '●', '▲', '♥', '✸']

export default function ParticleBurst({ x, y, color, count = 18 }) {
  const [items] = useState(() =>
    Array.from({ length: count }, (_, i) => {
      const angle = (360 / count) * i + Math.random() * 20
      const dist = 50 + Math.random() * 60
      const rad = (angle * Math.PI) / 180
      return {
        id: i,
        char: CHARS[i % CHARS.length],
        tx: Math.cos(rad) * dist,
        ty: Math.sin(rad) * dist,
        size: 8 + Math.random() * 8,
      }
    })
  )

  return (
    <>
      {items.map(p => (
        <span
          key={p.id}
          style={{
            position: 'fixed',
            left: x,
            top: y,
            fontSize: p.size,
            color,
            pointerEvents: 'none',
            zIndex: 9999,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            animation: 'shared-particle-burst 0.8s ease-out forwards',
          }}
        >
          {p.char}
        </span>
      ))}
    </>
  )
}
