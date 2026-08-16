import ParticleBurst from '../components/ParticleBurst'
import { useState, useEffect, useRef, useCallback } from 'react'

const OPTIONS = [
  { id: 'Rock',     emoji: '✊', label: 'Rock',     color: '#f87171', glow: 'rgba(248,113,113,0.5)' },
  { id: 'Paper',    emoji: '✋', label: 'Paper',    color: '#60a5fa', glow: 'rgba(96,165,250,0.5)'  },
  { id: 'Scissors', emoji: '✌️', label: 'Scissors', color: '#4ade80', glow: 'rgba(74,222,128,0.5)' },
]

const OPTIONS_BY_ID = Object.fromEntries(OPTIONS.map(o => [o.id, o]))

const BEATS = { Rock: 'Scissors', Paper: 'Rock', Scissors: 'Paper' }

const RESULT_CONFIG = {
  Player: { label: '🎉 You Win!',   gradient: 'linear-gradient(135deg, #4ade80, #06b6d4)', particleColor: '#4ade80' },
  CPU:    { label: '💀 CPU Wins!',  gradient: 'linear-gradient(135deg, #f87171, #f59e0b)', particleColor: '#f87171' },
  Draw:   { label: "🤝 It's a Draw!", gradient: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', particleColor: '#a78bfa' },
}


// ── Choice card ─────────────────────────────────────────────────────────────
function ChoiceCard({ opt, onClick, disabled }) {
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

// ── Arena display ────────────────────────────────────────────────────────────
function Arena({ result }) {
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
  const pOpt = OPTIONS_BY_ID[player]
  const cOpt = OPTIONS_BY_ID[cpu]
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

// ── Countdown ripple ─────────────────────────────────────────────────────────
function CountdownRipple({ count }) {
  return (
    <div className="rps-countdown">
      <span key={count} className="rps-countdown-num">{count}</span>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function RockPaperScissors() {
  const [score, setScore]       = useState({ player: 0, cpu: 0, rounds: 0 })
  const [result, setResult]     = useState(null)
  const [phase, setPhase]       = useState('idle')   // idle | counting | revealing | done
  const [countdown, setCountdown] = useState(null)
  const [pendingChoice, setPending] = useState(null)
  const [message, setMessage]   = useState('')
  const [streak, setStreak]     = useState(0)
  const [bursts, setBursts]     = useState([])
  const burstId = useRef(0)

  const addBurst = useCallback((color) => {
    const id  = ++burstId.current
    const x   = window.innerWidth  / 2 + (Math.random() - 0.5) * 200
    const y   = window.innerHeight / 2 + (Math.random() - 0.5) * 100
    setBursts(b => [...b, { id, x, y, color }])
    setTimeout(() => setBursts(b => b.filter(p => p.id !== id)), 1000)
  }, [])

  const getWinner = (p, c) => {
    if (p === c) return 'Draw'
    return BEATS[p] === c ? 'Player' : 'CPU'
  }

  const play = (choice) => {
    if (phase !== 'idle') return
    setPhase('counting')
    setPending(choice)
    setCountdown(3)
  }

  // Countdown ticker
  useEffect(() => {
    if (phase !== 'counting') return
    if (countdown === 0) {
      setPhase('revealing')
      setCountdown(null)
      return
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 600)
    return () => clearTimeout(t)
  }, [phase, countdown])

  // Reveal result
  useEffect(() => {
    if (phase !== 'revealing') return
    const cpuChoice = OPTIONS[Math.floor(Math.random() * 3)].id
    const winner    = getWinner(pendingChoice, cpuChoice)
    const cfg       = RESULT_CONFIG[winner]

    setResult({ player: pendingChoice, cpu: cpuChoice, winner })
    setScore(prev => ({
      player: prev.player + (winner === 'Player' ? 1 : 0),
      cpu:    prev.cpu    + (winner === 'CPU'    ? 1 : 0),
      rounds: prev.rounds + 1,
    }))
    setStreak(prev => winner === 'Player' ? prev + 1 : winner === 'CPU' ? 0 : prev)
    setMessage(cfg.label)
    setPhase('done')

    // Multiple bursts for visual impact
    for (let i = 0; i < (winner === 'Draw' ? 2 : 4); i++) {
      setTimeout(() => addBurst(cfg.particleColor), i * 120)
    }
  }, [phase])

  const reset = () => {
    setPhase('idle')
    setResult(null)
    setMessage('')
    setPending(null)
  }

  const resetAll = () => {
    reset()
    setScore({ player: 0, cpu: 0, rounds: 0 })
    setStreak(0)
  }

  const winPct = score.rounds ? Math.round((score.player / score.rounds) * 100) : 0

  return (
    <>
      {/* Injected styles */}
      <style>{RPS_STYLES}</style>

      {/* Particle bursts */}
      {bursts.map(b => <ParticleBurst key={b.id} x={b.x} y={b.y} color={b.color} />)}

      <div className="rps-root">
        {/* Animated background orbs */}
        <div className="rps-orb rps-orb-1" />
        <div className="rps-orb rps-orb-2" />
        <div className="rps-orb rps-orb-3" />

        {/* Score panel */}
        <div className="rps-scoreboard">
          <ScoreBox label="You" value={score.player} color="#4ade80" />
          <div className="rps-scoreboard-center">
            <div className="rps-rounds">{score.rounds} Rounds</div>
            <div className="rps-winbar">
              <div className="rps-winbar-fill" style={{ width: `${winPct}%` }} />
            </div>
            <div className="rps-winpct">{winPct}% win rate</div>
          </div>
          <ScoreBox label="CPU" value={score.cpu} color="#f87171" />
        </div>

        {/* Streak badge */}
        {streak >= 2 && (
          <div className="rps-streak">
            🔥 {streak} Win Streak!
          </div>
        )}

        {/* Countdown overlay */}
        {phase === 'counting' && countdown !== null && (
          <CountdownRipple count={countdown} />
        )}

        {/* Arena */}
        <Arena result={result} />

        {/* Result message */}
        {message && (
          <div
            className="rps-result-msg"
            style={{ background: RESULT_CONFIG[result?.winner]?.gradient }}
          >
            {message}
          </div>
        )}

        {/* Choice buttons or play-again */}
        {phase === 'idle' || phase === 'counting' ? (
          <>
            <p className="rps-prompt">
              {phase === 'counting' ? 'Get ready…' : 'Choose your weapon'}
            </p>
            <div className="rps-choices">
              {OPTIONS.map(opt => (
                <ChoiceCard
                  key={opt.id}
                  opt={opt}
                  onClick={() => play(opt.id)}
                  disabled={phase !== 'idle'}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="rps-actions">
            <button className="rps-btn rps-btn-primary" onClick={reset}>
              🔄 Play Again
            </button>
            <button className="rps-btn rps-btn-ghost" onClick={resetAll}>
              Reset Score
            </button>
          </div>
        )}

        {/* History hint */}
        {score.rounds > 0 && (
          <div className="rps-hint">
            W {score.player} · D {score.rounds - score.player - score.cpu} · L {score.cpu}
          </div>
        )}
      </div>
    </>
  )
}

