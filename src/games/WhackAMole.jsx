import { useState, useEffect } from 'react'

export default function WhackAMole() {
  const [score, setScore]     = useState(0)
  const [best, setBest]       = useState(0)
  const [active, setActive]   = useState(-1)
  const [miss, setMiss]       = useState(null)
  const [hit, setHit]         = useState(null)
  const [speed, setSpeed]     = useState(900)
  const [started, setStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)

  const start = () => {
    setScore(0)
    setActive(-1)
    setSpeed(900)
    setTimeLeft(30)
    setStarted(true)
    setMiss(null)
    setHit(null)
  }

  // Mole popping
  useEffect(() => {
    if (!started) return
    const interval = setInterval(() => {
      setActive(Math.floor(Math.random() * 16))
    }, speed)
    return () => clearInterval(interval)
  }, [started, speed])

  // Timer & speed ramp
  useEffect(() => {
    if (!started) return
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t)
          setStarted(false)
          setActive(-1)
          setBest(b => Math.max(b, score))
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [started, score])

  useEffect(() => {
    if (score > 0 && score % 5 === 0) setSpeed(s => Math.max(350, s - 80))
  }, [score])

  const clickHole = (i) => {
    if (!started) return
    if (i === active) {
      setScore(s => s + 1)
      setHit(i)
      setActive(-1)
      setTimeout(() => setHit(null), 300)
    } else {
      setMiss(i)
      setTimeout(() => setMiss(null), 250)
    }
  }

  const timerPct = (timeLeft / 30) * 100
  const timerColor = timeLeft > 15 ? '#4ade80' : timeLeft > 8 ? '#fbbf24' : '#f87171'

  return (
    <>
      <style>{WAM_STYLES}</style>
      <div className="wam-root">
        <div className="wam-orb wam-orb-1" /><div className="wam-orb wam-orb-2" />

        {/* stats */}
        <div className="wam-stats">
          <SC2 label="Score" value={score} color="#a78bfa" />
          <SC2 label="Best"  value={best}  color="#fbbf24" />
          <SC2 label="Time"  value={`${timeLeft}s`} color={timerColor} />
          <SC2 label="Speed" value={`${Math.round(1000/speed*10)/10}/s`} color="#4ade80" />
        </div>

        {/* timer bar */}
        <div className="wam-timer">
          <div className="wam-timer-fill" style={{ width: `${timerPct}%`, background: timerColor }} />
        </div>

        {/* grid */}
        <div className="wam-grid">
          {Array(16).fill(null).map((_, i) => (
            <div
              key={i}
              className={`wam-hole ${active === i ? 'wam-hole--active' : ''} ${hit === i ? 'wam-hole--hit' : ''} ${miss === i ? 'wam-hole--miss' : ''}`}
              onClick={() => clickHole(i)}
            >
              <div className="wam-dirt" />
              <div className={`wam-mole ${active === i ? 'wam-mole--up' : ''}`}>
                {active === i ? '🐹' : ''}
              </div>
              {hit === i && <div className="wam-hit-burst">💫</div>}
            </div>
          ))}
        </div>

        {!started && timeLeft === 0 && (
          <div className="wam-result">
            🏁 Final Score: <strong>{score}</strong>
            {score >= best && score > 0 ? ' 🏆 New Best!' : ''}
          </div>
        )}

        <button className="wam-btn" onClick={start} disabled={started}>
          {started ? '…Playing' : timeLeft === 0 ? '🔄 Play Again' : '▶ Start Game'}
        </button>
      </div>
    </>
  )
}

function SC2({ label, value, color }) {
  return (
    <div className="wam-chip" style={{ '--cc': color }}>
      <span className="wam-chip-label">{label}</span>
      <span className="wam-chip-val">{value}</span>
    </div>
  )
}

const WAM_STYLES = `
  @keyframes wam-orb { 0%,100%{transform:translate(0,0)} 40%{transform:translate(20px,-15px)} 70%{transform:translate(-12px,8px)} }
  @keyframes wam-mole-up { 0%{transform:translateY(100%) scale(0.8);opacity:0} 60%{transform:translateY(-15%) scale(1.1)} 100%{transform:translateY(0) scale(1);opacity:1} }
  @keyframes wam-hit { 0%{transform:scale(1)} 40%{transform:scale(0.7)} 100%{transform:scale(1)} }
  @keyframes wam-miss { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
  @keyframes wam-burst { 0%{transform:scale(0);opacity:1} 100%{transform:scale(2.5);opacity:0} }
  @keyframes wam-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  .wam-root { position:relative;display:flex;flex-direction:column;align-items:center;gap:14px;padding:24px 16px 32px;overflow:hidden;min-height:480px; }
  .wam-orb { position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none;z-index:0;animation:wam-orb 9s ease-in-out infinite; }
  .wam-orb-1 { width:240px;height:240px;background:rgba(251,191,36,0.1);top:-50px;left:-40px; }
  .wam-orb-2 { width:200px;height:200px;background:rgba(139,92,246,0.1);bottom:-40px;right:-40px;animation-delay:-4s; }

  .wam-stats { position:relative;z-index:1;display:flex;gap:8px;flex-wrap:wrap;justify-content:center;animation:wam-in 0.4s ease; }
  .wam-chip { display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 14px;border-radius:14px;background:rgba(15,23,42,0.65);border:1px solid rgba(139,92,246,0.22);backdrop-filter:blur(10px); }
  .wam-chip-label { font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b; }
  .wam-chip-val { font-size:18px;font-weight:800;color:var(--cc); }

  .wam-timer { position:relative;z-index:1;width:100%;max-width:380px;height:6px;border-radius:6px;background:rgba(255,255,255,0.07); }
  .wam-timer-fill { height:100%;border-radius:6px;transition:width 1s linear, background 0.4s ease;box-shadow:0 0 8px currentColor; }

  .wam-grid { position:relative;z-index:1;display:grid;grid-template-columns:repeat(4,1fr);gap:10px;width:100%;max-width:380px; }

  .wam-hole { position:relative;aspect-ratio:1;border-radius:50%;background:rgba(15,23,42,0.7);border:2.5px solid rgba(139,92,246,0.2);overflow:hidden;cursor:pointer;display:flex;align-items:flex-end;justify-content:center;transition:all 0.15s ease; }
  .wam-hole:hover { border-color:rgba(139,92,246,0.5); }
  .wam-hole--active { border-color:#fbbf24;box-shadow:0 0 20px rgba(251,191,36,0.4); }
  .wam-hole--hit { animation:wam-hit 0.3s ease; }
  .wam-hole--miss { animation:wam-miss 0.25s ease; }
  .wam-dirt { position:absolute;bottom:0;left:0;right:0;height:30%;background:linear-gradient(to top,rgba(92,58,16,0.5),transparent);border-radius:0 0 50% 50% / 0 0 100% 100%; }
  .wam-mole { font-size:28px;position:absolute;bottom:8%;left:0;right:0;text-align:center;opacity:0; }
  .wam-mole--up { animation:wam-mole-up 0.25s cubic-bezier(0.34,1.3,0.64,1) forwards; }
  .wam-hit-burst { position:absolute;top:20%;left:0;right:0;text-align:center;font-size:20px;animation:wam-burst 0.4s ease forwrads;pointer-events:none; }

  .wam-result { position:relative;z-index:1;padding:12px 24px;border-radius:16px;background:rgba(15,23,42,0.7);border:1.5px solid rgba(251,191,36,0.4);font-size:15px;color:#fbbf24; }

  .wam-btn { position:relative;z-index:1;padding:13px 32px;border-radius:14px;background:linear-gradient(135deg,#8b5cf6,#06b6d4);border:none;color:#fff;font-size:16px;font-weight:700;cursor:pointer;box-shadow:0 6px 18px rgba(139,92,246,0.4);transition:all 0.25s ease; }
  .wam-btn:hover:not(:disabled) { transform:translateY(-3px);box-shadow:0 10px 26px rgba(139,92,246,0.55); }
  .wam-btn:disabled { opacity:0.5;cursor:default;transform:none; }
`
