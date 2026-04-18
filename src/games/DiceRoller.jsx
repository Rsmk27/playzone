import { useState, useRef } from 'react'

// Pip positions for each face (row/col in a 3x3 grid, 0-indexed)
const PIPS = {
  1: [[1,1]],
  2: [[0,0],[2,2]],
  3: [[0,0],[1,1],[2,2]],
  4: [[0,0],[0,2],[2,0],[2,2]],
  5: [[0,0],[0,2],[1,1],[2,0],[2,2]],
  6: [[0,0],[0,2],[1,0],[1,2],[2,0],[2,2]],
}

function DieFace({ value }) {
  if (!value) return <div className="dr-face-blank">?</div>
  const pips = PIPS[value] || []
  const grid = Array(9).fill(false)
  pips.forEach(([r, c]) => { grid[r * 3 + c] = true })
  return (
    <div className="dr-pip-grid">
      {grid.map((active, i) => (
        <div key={i} className={`dr-pip ${active ? 'dr-pip--on' : ''}`} />
      ))}
    </div>
  )
}

export default function DiceRoller() {
  const [current, setCurrent]   = useState(null)
  const [rolling, setRolling]   = useState(false)
  const [history, setHistory]   = useState([])
  const [display, setDisplay]   = useState(null)   // shown during roll flicker
  const intervalRef             = useRef(null)

  const stats = history.length
    ? {
        avg:  (history.reduce((a, b) => a + b, 0) / history.length).toFixed(1),
        max:  Math.max(...history),
        min:  Math.min(...history),
        sixes: history.filter(n => n === 6).length,
      }
    : null

  const roll = () => {
    if (rolling) return
    setRolling(true)

    let ticks = 0
    const total = 16
    intervalRef.current = setInterval(() => {
      ticks++
      setDisplay(Math.floor(Math.random() * 6) + 1)
      if (ticks >= total) {
        clearInterval(intervalRef.current)
        const result = Math.floor(Math.random() * 6) + 1
        setCurrent(result)
        setDisplay(result)
        setHistory(h => [...h, result])
        setRolling(false)
      }
    }, 70)
  }

  const reset = () => {
    setHistory([])
    setCurrent(null)
    setDisplay(null)
  }

  const faceValue = display ?? current

  return (
    <>
      <style>{DR_STYLES}</style>
      <div className="dr-root">
        <div className="dr-orb dr-orb-1" />
        <div className="dr-orb dr-orb-2" />

        {/* stats row */}
        {stats && (
          <div className="dr-stats">
            <StatChip label="Avg" value={stats.avg} color="#a78bfa" />
            <StatChip label="Min" value={stats.min} color="#38bdf8" />
            <StatChip label="Max" value={stats.max} color="#f472b6" />
            <StatChip label="6s" value={stats.sixes} color="#4ade80" />
            <StatChip label="Rolls" value={history.length} color="#fbbf24" />
          </div>
        )}

        {/* 3D die */}
        <div className={`dr-scene ${rolling ? 'dr-scene--rolling' : ''}`}>
          <div className="dr-die">
            <DieFace value={faceValue} />
          </div>
          {rolling && <div className="dr-ripple" />}
        </div>

        {/* big number */}
        <div className="dr-number" style={{ opacity: faceValue ? 1 : 0.2 }}>
          {faceValue ?? '–'}
        </div>

        {/* roll button */}
        <button className="dr-roll-btn" onClick={roll} disabled={rolling}>
          {rolling ? '🎲 Rolling…' : '🎲 Roll Dice'}
        </button>

        {/* history */}
        {history.length > 0 && (
          <>
            <div className="dr-history">
              {history.slice(-12).map((n, i) => (
                <div
                  key={i}
                  className="dr-hist-chip"
                  style={{ '--hc': n === 6 ? '#4ade80' : n === 1 ? '#f87171' : '#8b5cf6' }}
                >
                  {n}
                </div>
              ))}
            </div>
            <button className="dr-ghost-btn" onClick={reset}>Clear History</button>
          </>
        )}
      </div>
    </>
  )
}

function StatChip({ label, value, color }) {
  return (
    <div className="dr-stat-chip" style={{ '--dc': color }}>
      <span className="dr-stat-label">{label}</span>
      <span className="dr-stat-val">{value}</span>
    </div>
  )
}

const DR_STYLES = `
  @keyframes dr-orb { 0%,100%{transform:translate(0,0)}40%{transform:translate(20px,-15px)}70%{transform:translate(-12px,8px)} }
  @keyframes dr-roll {
    0%   { transform:rotateX(0)   rotateY(0)   rotateZ(0); }
    25%  { transform:rotateX(180deg) rotateY(90deg)  rotateZ(45deg); }
    50%  { transform:rotateX(90deg)  rotateY(270deg) rotateZ(180deg); }
    75%  { transform:rotateX(270deg) rotateY(180deg) rotateZ(270deg); }
    100% { transform:rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
  }
  @keyframes dr-ripple-anim {
    0%   { transform:scale(0.8); opacity:0.7; }
    100% { transform:scale(2.2); opacity:0; }
  }
  @keyframes dr-num-pop {
    0%  { transform:scale(0.6); opacity:0; }
    60% { transform:scale(1.15); opacity:1; }
    100%{ transform:scale(1); }
  }
  @keyframes dr-slide-up { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
  @keyframes dr-chip-in { from{transform:scale(0) rotate(-20deg);opacity:0}to{transform:scale(1) rotate(0);opacity:1} }

  .dr-root {
    position:relative;display:flex;flex-direction:column;
    align-items:center;gap:18px;padding:24px 16px 32px;
    overflow:hidden;min-height:500px;
  }
  .dr-orb { position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none;z-index:0;animation:dr-orb 10s ease-in-out infinite; }
  .dr-orb-1 { width:220px;height:220px;background:rgba(139,92,246,0.15);top:-50px;left:-40px; }
  .dr-orb-2 { width:180px;height:180px;background:rgba(6,182,212,0.12);bottom:-40px;right:-40px;animation-delay:-5s; }

  /* stats */
  .dr-stats {
    position:relative;z-index:1;display:flex;gap:8px;flex-wrap:wrap;justify-content:center;
    animation:dr-slide-up 0.4s ease;
  }
  .dr-stat-chip {
    display:flex;flex-direction:column;align-items:center;gap:2px;
    padding:8px 12px;border-radius:12px;
    background:rgba(15,23,42,0.65);border:1px solid rgba(139,92,246,0.2);
    backdrop-filter:blur(10px);min-width:52px;
  }
  .dr-stat-label { font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b; }
  .dr-stat-val   { font-size:18px;font-weight:800;color:var(--dc); }

  /* 3D die scene */
  .dr-scene {
    position:relative;z-index:1;
    width:140px;height:140px;perspective:800px;
  }
  .dr-die {
    width:100%;height:100%;
    border-radius:22px;
    background:radial-gradient(circle at 30% 30%, rgba(255,255,255,0.12), rgba(15,23,42,0.9));
    border:2px solid rgba(139,92,246,0.4);
    box-shadow:0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.15),
               inset 0 2px 8px rgba(255,255,255,0.08);
    display:flex;align-items:center;justify-content:center;
    transition:box-shadow 0.3s ease;
  }
  .dr-scene--rolling .dr-die {
    animation:dr-roll 0.85s linear infinite;
    box-shadow:0 12px 40px rgba(139,92,246,0.5), 0 0 30px rgba(139,92,246,0.3);
  }
  .dr-ripple {
    position:absolute;inset:-10px;
    border-radius:30px;
    border:2px solid rgba(139,92,246,0.6);
    animation:dr-ripple-anim 0.7s ease-out infinite;
    pointer-events:none;
  }

  /* pip grid */
  .dr-pip-grid {
    display:grid;grid-template-columns:repeat(3,1fr);gap:6px;
    width:90px;height:90px;padding:4px;
  }
  .dr-pip {
    border-radius:50%;
    background:transparent;
    transition:background 0.08s ease, box-shadow 0.08s ease;
  }
  .dr-pip--on {
    background:radial-gradient(circle at 35% 35%, #e0e7ff, #8b5cf6);
    box-shadow:0 0 8px rgba(139,92,246,0.7);
  }
  .dr-face-blank { font-size:48px;color:rgba(139,92,246,0.3); }

  /* big number */
  .dr-number {
    position:relative;z-index:1;
    font-size:72px;font-weight:900;line-height:1;
    background:linear-gradient(135deg,#8b5cf6,#06b6d4);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    animation:dr-num-pop 0.35s cubic-bezier(0.34,1.56,0.64,1);
    transition:opacity 0.3s ease;
  }

  /* roll button */
  .dr-roll-btn {
    position:relative;z-index:1;
    padding:16px 44px;border-radius:18px;
    background:linear-gradient(135deg,#8b5cf6,#06b6d4);
    border:none;color:#fff;font-size:18px;font-weight:800;
    cursor:pointer;
    box-shadow:0 8px 28px rgba(139,92,246,0.5);
    transition:all 0.25s ease;letter-spacing:0.5px;
  }
  .dr-roll-btn:hover:not(:disabled) { transform:translateY(-4px);box-shadow:0 14px 36px rgba(139,92,246,0.65); }
  .dr-roll-btn:active:not(:disabled){ transform:translateY(0); }
  .dr-roll-btn:disabled { opacity:0.55;cursor:not-allowed;transform:none; }

  /* history */
  .dr-history { position:relative;z-index:1;display:flex;gap:8px;flex-wrap:wrap;justify-content:center; }
  .dr-hist-chip {
    width:36px;height:36px;border-radius:10px;
    display:flex;align-items:center;justify-content:center;
    font-size:16px;font-weight:800;color:var(--hc);
    background:rgba(15,23,42,0.7);
    border:1.5px solid var(--hc);
    box-shadow:0 0 8px color-mix(in srgb,var(--hc) 30%,transparent);
    animation:dr-chip-in 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .dr-ghost-btn {
    position:relative;z-index:1;
    padding:9px 22px;border-radius:12px;
    background:rgba(30,27,75,0.6);
    border:1.5px solid rgba(139,92,246,0.3);
    color:#94a3b8;font-size:13px;font-weight:600;cursor:pointer;
    transition:all 0.2s ease;
  }
  .dr-ghost-btn:hover { background:rgba(139,92,246,0.15);color:#f1f5f9;transform:translateY(-2px); }
`
