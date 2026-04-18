import { useState, useRef, useEffect } from 'react'

export default function ReactionTest() {
  const [phase, setPhase]    = useState('idle')   // idle | ready | go | result | tooEarly
  const [reactionTime, setRT] = useState(null)
  const [best, setBest]      = useState(null)
  const [avg, setAvg]        = useState(null)
  const [tries, setTries]    = useState(0)
  const [history, setHistory] = useState([])
  const timerRef   = useRef(null)
  const startRef   = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const click = () => {
    if (phase === 'idle' || phase === 'result' || phase === 'tooEarly') {
      setPhase('ready')
      const delay = 2000 + Math.random() * 3000
      timerRef.current = setTimeout(() => {
        setPhase('go')
        startRef.current = performance.now()
      }, delay)
    } else if (phase === 'ready') {
      clearTimeout(timerRef.current)
      setPhase('tooEarly')
    } else if (phase === 'go') {
      const t = Math.round(performance.now() - startRef.current)
      const h = [...history, t]
      setHistory(h)
      setRT(t)
      setBest(prev => prev === null ? t : Math.min(prev, t))
      setAvg(Math.round(h.reduce((a, b) => a + b, 0) / h.length))
      setTries(n => n + 1)
      setPhase('result')
    }
  }

  const reset = () => {
    clearTimeout(timerRef.current)
    setPhase('idle')
    setRT(null)
    setBest(null)
    setAvg(null)
    setTries(0)
    setHistory([])
  }

  const rating = () => {
    if (!best) return null
    if (best < 180) return { text: 'Elite Reflexes ⚡', color: '#4ade80' }
    if (best < 230) return { text: 'Great Reflexes 🦅', color: '#a78bfa' }
    if (best < 300) return { text: 'Good Reflexes 👍', color: '#fbbf24' }
    return { text: 'Keep Practicing 🎯', color: '#f87171' }
  }

  const cfg = {
    idle:     { bg: 'linear-gradient(135deg,#1e1b4b,#0c1445)', msg: 'Tap to Start', sub: 'Tap when it turns GREEN', icon: '👆' },
    ready:    { bg: 'linear-gradient(135deg,#78350f,#92400e)', msg: 'Wait…',         sub: 'Do NOT click yet!', icon: '⏳' },
    go:       { bg: 'linear-gradient(135deg,#052e16,#14532d)', msg: 'CLICK NOW!',    sub: '',                  icon: '⚡' },
    result:   { bg: 'linear-gradient(135deg,#1e1b4b,#0c1445)', msg: `${reactionTime} ms`, sub: 'Click to try again', icon: '🎯' },
    tooEarly: { bg: 'linear-gradient(135deg,#4c0519,#7f1d1d)', msg: 'Too Early! 😅', sub: 'Wait for green! Click to retry', icon: '❌' },
  }
  const c = cfg[phase] || cfg.idle
  const r = rating()

  return (
    <>
      <style>{RT_STYLES}</style>
      <div className="rt-root">
        <div className="rt-orb rt-orb-1" />
        <div className="rt-orb rt-orb-2" />

        {/* stats bar */}
        <div className="rt-stats">
          <StatBox label="Tries"   value={tries} color="#a78bfa" />
          <StatBox label="Last"    value={reactionTime !== null ? `${reactionTime}ms` : '—'} color="#60a5fa" />
          <StatBox label="Best"    value={best !== null ? `${best}ms` : '—'}    color="#4ade80" />
          <StatBox label="Avg"     value={avg !== null ? `${avg}ms` : '—'}      color="#fbbf24" />
        </div>

        {/* rating badge */}
        {r && (
          <div className="rt-rating" style={{ color: r.color, borderColor: r.color+'55' }}>
            {r.text}
          </div>
        )}

        {/* main tap zone */}
        <div
          className={`rt-zone ${phase === 'go' ? 'rt-zone--go' : ''} ${phase === 'tooEarly' ? 'rt-zone--err' : ''}`}
          style={{ background: c.bg }}
          onClick={click}
        >
          <span className="rt-icon">{c.icon}</span>
          <span className="rt-zone-msg">{c.msg}</span>
          {c.sub && <span className="rt-zone-sub">{c.sub}</span>}
          {phase === 'go' && <div className="rt-ripple" />}
        </div>

        {/* history dots */}
        {history.length > 0 && (
          <div className="rt-history">
            {history.slice(-10).map((t, i) => {
              const pct = Math.min(1, t / 600)
              const hue = Math.round(120 - pct * 120)
              return (
                <div key={i} className="rt-hist-dot" style={{ background: `hsl(${hue},80%,55%)` }} title={`${t}ms`} />
              )
            })}
          </div>
        )}

        <button className="rt-reset" onClick={reset}>Reset Stats</button>
      </div>
    </>
  )
}

function StatBox({ label, value, color }) {
  return (
    <div className="rt-stat" style={{ '--bc': color }}>
      <span className="rt-stat-label">{label}</span>
      <span className="rt-stat-val">{value}</span>
    </div>
  )
}

const RT_STYLES = `
  @keyframes rt-orb { 0%,100%{transform:translate(0,0)} 40%{transform:translate(20px,-15px)} 70%{transform:translate(-12px,8px)} }
  @keyframes rt-go-pulse { 0%,100%{box-shadow:0 0 40px rgba(74,222,128,0.3)} 50%{box-shadow:0 0 80px rgba(74,222,128,0.6)} }
  @keyframes rt-ripple { 0%{transform:scale(0);opacity:0.8} 100%{transform:scale(4);opacity:0} }
  @keyframes rt-in { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes rt-bounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }

  .rt-root { position:relative;display:flex;flex-direction:column;align-items:center;gap:14px;padding:24px 16px 32px;overflow:hidden;min-height:520px; }
  .rt-orb { position:absolute;border-radius:50%;filter:blur(72px);pointer-events:none;z-index:0;animation:rt-orb 9s ease-in-out infinite; }
  .rt-orb-1 { width:240px;height:240px;background:rgba(74,222,128,0.1);top:-50px;left:-40px; }
  .rt-orb-2 { width:200px;height:200px;background:rgba(251,191,36,0.1);bottom:-40px;right:-40px;animation-delay:-4s; }

  .rt-stats { position:relative;z-index:1;display:flex;gap:8px;animation:rt-in 0.4s ease; }
  .rt-stat { display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 12px;border-radius:14px;background:rgba(15,23,42,0.65);border:1px solid rgba(139,92,246,0.22);backdrop-filter:blur(10px); }
  .rt-stat-label { font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b; }
  .rt-stat-val { font-size:16px;font-weight:700;color:var(--bc); }

  .rt-rating { position:relative;z-index:1;padding:6px 18px;border-radius:20px;background:rgba(15,23,42,0.6);border:1.5px solid;font-size:13px;font-weight:700;animation:rt-bounce 2s ease-in-out infinite; }

  .rt-zone {
    position:relative;z-index:1;
    width:100%;max-width:380px;min-height:240px;border-radius:28px;
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;
    cursor:pointer;user-select:none;
    border:3px solid rgba(255,255,255,0.08);
    transition:transform 0.1s ease;overflow:hidden;
  }
  .rt-zone:active { transform:scale(0.97); }
  .rt-zone--go { animation:rt-go-pulse 1s ease-in-out infinite; }
  .rt-icon { font-size:48px; }
  .rt-zone-msg { font-size:32px;font-weight:900;color:#fff;text-align:center; }
  .rt-zone-sub { font-size:13px;color:rgba(255,255,255,0.6);text-align:center; }

  .rt-ripple { position:absolute;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,0.3);animation:rt-ripple 0.8s ease-out; }

  .rt-history { position:relative;z-index:1;display:flex;gap:6px;align-items:center; }
  .rt-hist-dot { width:12px;height:12px;border-radius:50%;transition:transform 0.2s; }
  .rt-hist-dot:hover { transform:scale(1.4); }

  .rt-reset { position:relative;z-index:1;padding:10px 24px;border-radius:12px;background:rgba(15,23,42,0.6);border:1.5px solid rgba(139,92,246,0.3);color:#64748b;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s ease; }
  .rt-reset:hover { color:#94a3b8;border-color:rgba(139,92,246,0.6); }
`
