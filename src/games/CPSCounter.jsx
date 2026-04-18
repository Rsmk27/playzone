import { useState, useEffect, useRef } from 'react'

export default function CPSCounter() {
  const [clicks, setClicks]     = useState(0)
  const [timeLeft, setTimeLeft] = useState(10)
  const [cps, setCps]           = useState(0)
  const [testing, setTesting]   = useState(false)
  const [done, setDone]         = useState(false)
  const [best, setBest]         = useState(0)
  const [history, setHistory]   = useState([])
  const startRef  = useRef(null)
  const timerRef  = useRef(null)
  const clicksRef = useRef(0)

  const rating = (c) => {
    if (c >= 14) return { text: 'Legendary 🔥', color: '#f87171' }
    if (c >= 10) return { text: 'Pro 💜', color: '#a78bfa' }
    if (c >= 7)  return { text: 'Fast ⚡', color: '#fbbf24' }
    if (c >= 4)  return { text: 'Average 😎', color: '#60a5fa' }
    return { text: 'Beginner 🐢', color: '#4ade80' }
  }

  const startTest = () => {
    clicksRef.current = 0
    setClicks(0)
    setCps(0)
    setTimeLeft(10)
    setTesting(true)
    setDone(false)
    startRef.current = Date.now()

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          finishTest()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const finishTest = () => {
    setTesting(false)
    setDone(true)
    const elapsed = (Date.now() - startRef.current) / 1000
    const finalCps = parseFloat((clicksRef.current / elapsed).toFixed(2))
    const finalCpsN = isNaN(finalCps) ? 0 : finalCps
    setCps(finalCpsN)
    setBest(b => Math.max(b, finalCpsN))
    setHistory(h => [...h.slice(-9), finalCpsN])
  }

  const handleClick = () => {
    if (!testing) return
    clicksRef.current++
    setClicks(clicksRef.current)
    const elapsed = (Date.now() - startRef.current) / 1000
    if (elapsed > 0) setCps(parseFloat((clicksRef.current / elapsed).toFixed(2)))
  }

  useEffect(() => () => clearInterval(timerRef.current), [])

  const timerArc = () => {
    const r = 60, circ = 2 * Math.PI * r
    return circ - (timeLeft / 10) * circ
  }

  const r = done ? rating(cps) : null

  return (
    <>
      <style>{CPSS_STYLES}</style>
      <div className="cps-root">
        <div className="cps-orb cps-orb-1" /><div className="cps-orb cps-orb-2" />

        {/* header stats */}
        <div className="cps-stats">
          <SC label="Clicks" value={clicks} color="#a78bfa" />
          <SC label="CPS"    value={cps.toFixed ? cps.toFixed(2) : cps} color={testing ? '#4ade80' : '#60a5fa'} />
          <SC label="Best"   value={best.toFixed ? best.toFixed(2) : best} color="#fbbf24" />
        </div>

        {/* circular zone */}
        <div
          className={`cps-zone ${testing ? 'cps-zone--active' : ''} ${done ? 'cps-zone--done' : ''}`}
          onClick={handleClick}
        >
          <svg className="cps-ring" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="6" />
            <circle
              cx="70" cy="70" r="60" fill="none"
              stroke={testing ? '#8b5cf6' : done ? (r?.color || '#4ade80') : '#4c1d95'}
              strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${2*Math.PI*60}`}
              strokeDashoffset={testing ? timerArc() : 0}
              transform="rotate(-90 70 70)"
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s ease' }}
            />
          </svg>
          <div className="cps-zone-inner">
            {testing ? (
              <>
                <span className="cps-time">{timeLeft}</span>
                <span className="cps-time-sub">CLICK!</span>
              </>
            ) : done ? (
              <>
                <span className="cps-result-num" style={{ color: r?.color }}>{cps.toFixed ? cps.toFixed(2) : cps}</span>
                <span className="cps-result-lbl">CPS</span>
              </>
            ) : (
              <>
                <span className="cps-idle-icon">🖱️</span>
                <span className="cps-idle-lbl">Click here!</span>
              </>
            )}
          </div>
          {testing && <div className="cps-ripple" key={clicks} />}
        </div>

        {/* rating */}
        {done && r && (
          <div className="cps-rating" style={{ color: r.color, borderColor: r.color + '55' }}>
            {r.text}
          </div>
        )}

        {/* history graph */}
        {history.length > 1 && (
          <div className="cps-history">
            <span className="cps-hist-label">History</span>
            <div className="cps-hist-bars">
              {history.map((v, i) => {
                const pct = Math.min(100, (v / 15) * 100)
                return (
                  <div key={i} className="cps-hist-bar-wrap">
                    <div className="cps-hist-bar" style={{ height: `${pct}%`, background: rating(v).color }} title={`${v} CPS`} />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="cps-btns">
          <button className="cps-btn" onClick={startTest} disabled={testing}>
            {done ? '🔄 Play Again' : '▶ Start Test'}
          </button>
        </div>
      </div>
    </>
  )
}

function SC({ label, value, color }) {
  return (
    <div className="cps-chip" style={{ '--cc': color }}>
      <span className="cps-chip-label">{label}</span>
      <span className="cps-chip-val">{value}</span>
    </div>
  )
}

const CPSS_STYLES = `
  @keyframes cps-orb { 0%,100%{transform:translate(0,0)} 40%{transform:translate(20px,-15px)} 70%{transform:translate(-12px,8px)} }
  @keyframes cps-ripple { 0%{transform:translate(-50%,-50%) scale(0);opacity:0.7} 100%{transform:translate(-50%,-50%) scale(3);opacity:0} }
  @keyframes cps-active { 0%,100%{box-shadow:0 0 30px rgba(139,92,246,0.3)} 50%{box-shadow:0 0 60px rgba(139,92,246,0.5)} }
  @keyframes cps-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cps-rating-in { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }

  .cps-root { position:relative;display:flex;flex-direction:column;align-items:center;gap:16px;padding:24px 16px 32px;overflow:hidden;min-height:480px; }
  .cps-orb { position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none;z-index:0;animation:cps-orb 9s ease-in-out infinite; }
  .cps-orb-1 { width:240px;height:240px;background:rgba(139,92,246,0.12);top:-50px;left:-40px; }
  .cps-orb-2 { width:200px;height:200px;background:rgba(6,182,212,0.1);bottom:-40px;right:-40px;animation-delay:-4s; }

  .cps-stats { position:relative;z-index:1;display:flex;gap:10px;animation:cps-in 0.4s ease; }
  .cps-chip { display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 16px;border-radius:14px;background:rgba(15,23,42,0.65);border:1px solid rgba(139,92,246,0.22);backdrop-filter:blur(10px); }
  .cps-chip-label { font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b; }
  .cps-chip-val { font-size:22px;font-weight:800;color:var(--cc); }

  .cps-zone {
    position:relative;z-index:1;width:200px;height:200px;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;user-select:none;
    background:rgba(15,23,42,0.7);border:2px solid rgba(139,92,246,0.2);
    transition:all 0.15s ease;overflow:hidden;backdrop-filter:blur(10px);
  }
  .cps-zone:active { transform:scale(0.94); }
  .cps-zone--active { animation:cps-active 1s ease-in-out infinite;border-color:#8b5cf6; }
  .cps-ring { position:absolute;inset:0;width:100%;height:100%;pointer-events:none; }
  .cps-zone-inner { display:flex;flex-direction:column;align-items:center;z-index:1; }
  .cps-time { font-size:52px;font-weight:900;background:linear-gradient(135deg,#a78bfa,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent; }
  .cps-time-sub { font-size:14px;color:#8b5cf6;font-weight:700;text-transform:uppercase;letter-spacing:1px; }
  .cps-result-num { font-size:48px;font-weight:900; }
  .cps-result-lbl { font-size:13px;color:#64748b;font-weight:700;text-transform:uppercase; }
  .cps-idle-icon { font-size:40px; }
  .cps-idle-lbl { font-size:13px;color:#64748b;font-weight:600; }
  .cps-ripple { position:absolute;top:50%;left:50%;width:40px;height:40px;border-radius:50%;background:rgba(139,92,246,0.4);animation:cps-ripple 0.4s ease-out; }

  .cps-rating { position:relative;z-index:1;padding:8px 22px;border-radius:20px;background:rgba(15,23,42,0.6);border:1.5px solid;font-size:15px;font-weight:700;animation:cps-rating-in 0.4s cubic-bezier(0.34,1.2,0.64,1); }

  .cps-history { position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:6px;width:100%;max-width:320px; }
  .cps-hist-label { font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b; }
  .cps-hist-bars { display:flex;gap:5px;align-items:flex-end;height:50px;width:100%;padding:0 12px; }
  .cps-hist-bar-wrap { flex:1;height:100%;display:flex;align-items:flex-end; }
  .cps-hist-bar { width:100%;border-radius:4px 4px 0 0;min-height:4px;transition:height 0.4s ease; }

  .cps-btns { position:relative;z-index:1; }
  .cps-btn { padding:13px 32px;border-radius:14px;background:linear-gradient(135deg,#8b5cf6,#06b6d4);border:none;color:#fff;font-size:16px;font-weight:700;cursor:pointer;box-shadow:0 6px 18px rgba(139,92,246,0.4);transition:all 0.25s ease; }
  .cps-btn:hover:not(:disabled) { transform:translateY(-3px);box-shadow:0 10px 26px rgba(139,92,246,0.55); }
  .cps-btn:disabled { opacity:0.4;cursor:not-allowed;transform:none; }
`
