import { OPTIONS, RESULT_CONFIG } from './config.js';

export function Arena({ result }) {
  if (!result) return (
    <div className="rps-arena rps-arena--idle">
      <div className="rps-slot">
        <span className="rps-slot-emoji rps-slot-idle">❓</span>
        <span className="rps-slot-name">You</span>
      </div>
      <div className="rps-vs">VS</div>
      <div className="rps-slot">
        <span className="rps-slot-emoji rps-slot-idle">❓</span>
        <span className="rps-slot-name">CPU</span>
      </div>
    </div>
  )

  const { player, cpu, winner } = result
  const pOpt = OPTIONS.find(o => o.id === player)
  const cOpt = OPTIONS.find(o => o.id === cpu)
  const cfg  = RESULT_CONFIG[winner]

  return (
    <div className="rps-arena" style={{ '--result-gradient': cfg.gradient }}>
      <div className={`rps-slot ${winner === 'Player' ? 'rps-slot--win' : winner === 'Draw' ? 'rps-slot--draw' : 'rps-slot--lose'}`}>
        <span className="rps-slot-emoji rps-slot-bounce" style={{ '--slot-glow': pOpt.glow }}>{pOpt.emoji}</span>
        <span className="rps-slot-name">You</span>
      </div>
      <div className="rps-vs" style={{ background: cfg.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        {winner === 'Player' ? '🏆' : winner === 'CPU' ? '💀' : '🤝'}
      </div>
      <div className={`rps-slot ${winner === 'CPU' ? 'rps-slot--win' : winner === 'Draw' ? 'rps-slot--draw' : 'rps-slot--lose'}`}>
        <span className="rps-slot-emoji rps-slot-bounce" style={{ '--slot-glow': cOpt.glow }}>{cOpt.emoji}</span>
        <span className="rps-slot-name">CPU</span>
      </div>
    </div>
  )
}
