import { useState, useEffect, useRef, useCallback } from 'react'

const OPTIONS = [
  { id: 'Rock',     emoji: '✊', label: 'Rock',     color: '#f87171', glow: 'rgba(248,113,113,0.5)' },
  { id: 'Paper',    emoji: '✋', label: 'Paper',    color: '#60a5fa', glow: 'rgba(96,165,250,0.5)'  },
  { id: 'Scissors', emoji: '✌️', label: 'Scissors', color: '#4ade80', glow: 'rgba(74,222,128,0.5)' },
]

const BEATS = { Rock: 'Scissors', Paper: 'Rock', Scissors: 'Paper' }

const RESULT_CONFIG = {
  Player: { label: '🎉 You Win!',   gradient: 'linear-gradient(135deg, #4ade80, #06b6d4)', particleColor: '#4ade80' },
  CPU:    { label: '💀 CPU Wins!',  gradient: 'linear-gradient(135deg, #f87171, #f59e0b)', particleColor: '#f87171' },
  Draw:   { label: "🤝 It's a Draw!", gradient: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', particleColor: '#a78bfa' },
}

// ── Particle burst ──────────────────────────────────────────────────────────
function Particle({ x, y, color, onDone }) {
  const angle  = Math.random() * 360
  const speed  = 60 + Math.random() * 80
  const dx     = Math.cos((angle * Math.PI) / 180) * speed
  const dy     = Math.sin((angle * Math.PI) / 180) * speed
  const size   = 6 + Math.random() * 8
  const shapes = ['●', '★', '◆', '▲', '♥']
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
        animation: `rps-particle 0.9s ease-out forwards`,
        '--dx': `${dx}px`,
        '--dy': `${dy}px`,
      }}
    >
      {shape}
    </span>
  )
}

function ParticleBurst({ origin, color, id }) {
  const [particles] = useState(() =>
    Array.from({ length: 22 }, (_, i) => i)
  )
  return (
    <>
      {particles.map(i => (
        <Particle key={`${id}-${i}`} x={origin.x} y={origin.y} color={color} />
      ))}
    </>
  )
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
      {bursts.map(b => <ParticleBurst key={b.id} id={b.id} origin={{ x: b.x, y: b.y }} color={b.color} />)}

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

function ScoreBox({ label, value, color }) {
  return (
    <div className="rps-score-box" style={{ '--scolor': color }}>
      <span className="rps-score-label">{label}</span>
      <span className="rps-score-value">{value}</span>
    </div>
  )
}

// ── Scoped styles ────────────────────────────────────────────────────────────
const RPS_STYLES = `
  @keyframes rps-particle {
    0%   { transform: translate(0, 0) scale(1); opacity: 1; }
    100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
  }
  @keyframes rps-bounce {
    0%, 100% { transform: translateY(0) scale(1); }
    40%       { transform: translateY(-18px) scale(1.15); }
    70%       { transform: translateY(-6px) scale(1.05); }
  }
  @keyframes rps-idle-float {
    0%, 100% { transform: translateY(0); opacity: 0.6; }
    50%       { transform: translateY(-8px); opacity: 1; }
  }
  @keyframes rps-countdown-pop {
    0%   { transform: scale(2.5); opacity: 0; }
    40%  { transform: scale(1); opacity: 1; }
    80%  { transform: scale(1); opacity: 1; }
    100% { transform: scale(0.5); opacity: 0; }
  }
  @keyframes rps-orb-drift {
    0%, 100% { transform: translate(0,0) scale(1); }
    33%       { transform: translate(30px,-20px) scale(1.05); }
    66%       { transform: translate(-20px,10px) scale(0.97); }
  }
  @keyframes rps-slide-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes rps-pulse-border {
    0%, 100% { box-shadow: 0 0 0 0 var(--choice-glow), inset 0 0 20px rgba(0,0,0,0.3); }
    50%       { box-shadow: 0 0 0 8px transparent, inset 0 0 20px rgba(0,0,0,0.3); }
  }
  @keyframes rps-streak-bounce {
    0%,100% { transform: scale(1); }
    50%     { transform: scale(1.07); }
  }
  @keyframes rps-win-flash {
    0%   { box-shadow: 0 0 0 0 var(--slot-glow, rgba(74,222,128,0.6)); }
    50%  { box-shadow: 0 0 36px 12px var(--slot-glow, rgba(74,222,128,0.6)); }
    100% { box-shadow: 0 0 0 0 var(--slot-glow, rgba(74,222,128,0.6)); }
  }

  .rps-root {
    position: relative;
    min-height: 520px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    padding: 24px 16px 32px;
    overflow: hidden;
  }

  /* ── background orbs ── */
  .rps-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(70px);
    pointer-events: none;
    animation: rps-orb-drift 8s ease-in-out infinite;
    z-index: 0;
  }
  .rps-orb-1 { width:300px; height:300px; background:rgba(139,92,246,0.18); top:-80px; left:-80px; animation-delay:0s; }
  .rps-orb-2 { width:250px; height:250px; background:rgba(6,182,212,0.14);  bottom:-60px; right:-60px; animation-delay:-3s; }
  .rps-orb-3 { width:200px; height:200px; background:rgba(248,113,113,0.1); top:40%; left:50%; animation-delay:-5s; }

  /* ── scoreboard ── */
  .rps-scoreboard {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 20px;
    background: rgba(15,23,42,0.6);
    border: 1px solid rgba(139,92,246,0.25);
    border-radius: 20px;
    padding: 14px 24px;
    backdrop-filter: blur(14px);
    width: 100%;
    max-width: 440px;
  }
  .rps-score-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    flex: 1;
  }
  .rps-score-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; }
  .rps-score-value { font-size: 36px; font-weight: 800; color: var(--scolor); line-height: 1; }
  .rps-scoreboard-center { flex: 1.5; display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .rps-rounds { font-size: 12px; color: #94a3b8; }
  .rps-winbar {
    width: 100%; height: 6px;
    background: rgba(139,92,246,0.15);
    border-radius: 99px; overflow: hidden;
  }
  .rps-winbar-fill {
    height: 100%;
    background: linear-gradient(90deg, #4ade80, #06b6d4);
    border-radius: 99px;
    transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
  }
  .rps-winpct { font-size: 11px; color: #94a3b8; }

  /* ── streak ── */
  .rps-streak {
    position: relative; z-index: 1;
    background: linear-gradient(135deg, #f59e0b, #ef4444);
    padding: 6px 18px;
    border-radius: 99px;
    font-size: 13px; font-weight: 700; color: #fff;
    animation: rps-streak-bounce 1.2s ease-in-out infinite;
    box-shadow: 0 4px 16px rgba(245,158,11,0.4);
  }

  /* ── countdown ── */
  .rps-countdown {
    position: fixed; inset: 0;
    display: flex; align-items: center; justify-content: center;
    z-index: 500; pointer-events: none;
  }
  .rps-countdown-num {
    font-size: 120px; font-weight: 900;
    background: linear-gradient(135deg, #8b5cf6, #06b6d4);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: rps-countdown-pop 0.58s ease forwards;
  }

  /* ── arena ── */
  .rps-arena {
    position: relative; z-index: 1;
    display: flex; align-items: center; gap: 24px;
    background: rgba(15,23,42,0.55);
    border: 1px solid rgba(139,92,246,0.2);
    border-radius: 24px;
    padding: 24px 32px;
    backdrop-filter: blur(14px);
    width: 100%; max-width: 440px;
    min-height: 130px;
    animation: rps-slide-up 0.4s ease;
  }
  .rps-slot {
    flex: 1;
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    transition: transform 0.3s ease;
  }
  .rps-slot-emoji {
    font-size: 56px; line-height: 1;
    display: block;
    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));
    transition: all 0.3s ease;
  }
  .rps-slot-idle { animation: rps-idle-float 2.5s ease-in-out infinite; }
  .rps-slot-bounce { animation: rps-bounce 0.7s ease, rps-win-flash 1.2s ease 0.7s; }
  .rps-slot-name { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
  .rps-slot--win .rps-slot-emoji { filter: drop-shadow(0 0 18px var(--slot-glow, rgba(74,222,128,0.6))); }
  .rps-slot--lose .rps-slot-emoji { opacity: 0.45; filter: grayscale(1); }
  .rps-slot--draw .rps-slot-emoji { filter: drop-shadow(0 0 12px rgba(167,139,250,0.5)); }
  .rps-vs {
    font-size: 28px; font-weight: 900;
    transition: all 0.3s ease;
  }

  /* ── result message ── */
  .rps-result-msg {
    position: relative; z-index: 1;
    padding: 10px 28px;
    border-radius: 99px;
    font-size: 18px; font-weight: 800; color: #fff;
    animation: rps-slide-up 0.35s ease;
    box-shadow: 0 8px 28px rgba(0,0,0,0.35);
    letter-spacing: 0.5px;
  }

  /* ── prompt ── */
  .rps-prompt {
    position: relative; z-index: 1;
    color: #94a3b8; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;
  }

  /* ── choice cards ── */
  .rps-choices {
    position: relative; z-index: 1;
    display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;
  }
  .rps-choice {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    width: 110px; padding: 20px 12px;
    background: rgba(15,23,42,0.65);
    border: 2px solid var(--choice-color, #8b5cf6);
    border-radius: 20px;
    cursor: pointer;
    transition: transform 0.18s cubic-bezier(.4,0,.2,1),
                box-shadow 0.25s ease,
                background 0.25s ease;
    animation: rps-pulse-border 2.5s ease-in-out infinite;
    backdrop-filter: blur(10px);
    position: relative; overflow: hidden;
  }
  .rps-choice::after {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(circle at center, var(--choice-glow, transparent) 0%, transparent 70%);
    opacity: 0; transition: opacity 0.25s ease;
  }
  .rps-choice:hover { 
    transform: translateY(-8px) scale(1.05);
    box-shadow: 0 16px 40px var(--choice-glow);
    background: rgba(30,27,75,0.8);
  }
  .rps-choice:hover::after { opacity: 1; }
  .rps-choice:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .rps-choice-emoji { font-size: 48px; line-height: 1; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4)); }
  .rps-choice-label { font-size: 13px; font-weight: 600; color: var(--choice-color); text-transform: uppercase; letter-spacing: 0.5px; }

  /* ── actions ── */
  .rps-actions {
    position: relative; z-index: 1;
    display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;
    animation: rps-slide-up 0.4s ease;
  }
  .rps-btn {
    padding: 12px 28px;
    border-radius: 14px;
    font-size: 15px; font-weight: 700;
    cursor: pointer;
    border: none;
    transition: all 0.25s ease;
  }
  .rps-btn-primary {
    background: linear-gradient(135deg, #8b5cf6, #06b6d4);
    color: #fff;
    box-shadow: 0 6px 20px rgba(139,92,246,0.45);
  }
  .rps-btn-primary:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(139,92,246,0.6); }
  .rps-btn-ghost {
    background: rgba(30,27,75,0.6);
    border: 1.5px solid rgba(139,92,246,0.35);
    color: #94a3b8;
  }
  .rps-btn-ghost:hover { background: rgba(139,92,246,0.15); color: #f1f5f9; transform: translateY(-2px); }

  /* ── hint ── */
  .rps-hint {
    position: relative; z-index: 1;
    font-size: 12px; color: #64748b; letter-spacing: 0.5px;
  }
`
