import { useState, useEffect } from 'react'

export default function SlidingPuzzle() {
  const [tiles, setTiles]   = useState([])
  const [moves, setMoves]   = useState(0)
  const [solved, setSolved] = useState(false)
  const [best, setBest]     = useState(null)
  const [moved, setMoved]   = useState(null)

  const shuffle = () => {
    let t = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0]
    for (let i = 0; i < 200; i++) {
      const e = t.indexOf(0)
      const opts = [e-4,e+4,e%4!==0?e-1:-1,e%4!==3?e+1:-1].filter(x=>x>=0&&x<16)
      const r = opts[Math.floor(Math.random()*opts.length)]
      ;[t[e],t[r]] = [t[r],t[e]]
    }
    setTiles(t)
    setMoves(0)
    setSolved(false)
    setMoved(null)
  }

  useEffect(() => { shuffle() }, [])

  const move = (idx) => {
    if (solved) return
    const e = tiles.indexOf(0)
    const valid = [e-4,e+4,e%4!==0?e-1:-1,e%4!==3?e+1:-1].filter(x=>x>=0&&x<16)
    if (!valid.includes(idx)) return
    const nt = [...tiles]
    ;[nt[e],nt[idx]] = [nt[idx],nt[e]]
    setTiles(nt)
    setMoves(m=>m+1)
    setMoved(idx)
    setTimeout(() => setMoved(null), 200)
    if (nt.slice(0,15).every((v,i)=>v===i+1) && nt[15]===0) {
      setSolved(true)
      setBest(b => b===null ? moves+1 : Math.min(b, moves+1))
    }
  }

  const tileColor = (n) => {
    if (n === 0) return null
    const hue = Math.round(260 - (n/15)*60)
    return `hsl(${hue},70%,55%)`
  }

  return (
    <>
      <style>{SP_STYLES}</style>
      <div className="sp-root">
        <div className="sp-orb sp-orb-1" /><div className="sp-orb sp-orb-2" />

        <div className="sp-stats">
          <SC label="Moves" value={moves}                   color="#a78bfa"/>
          <SC label="Best"  value={best !== null ? best : '—'} color="#fbbf24"/>
        </div>

        {solved && (
          <div className="sp-win">🎉 Solved in {moves} moves! {moves<=best?' 🏆 New best!':''}</div>
        )}

        <div className="sp-board">
          {tiles.map((n, idx) => (
            <div
              key={idx}
              className={`sp-tile ${n===0?'sp-tile--empty':''} ${moved===idx?'sp-tile--moved':''} ${solved&&n>0?'sp-tile--done':''}`}
              style={n!==0 ? { background: tileColor(n), boxShadow: `0 4px 14px ${tileColor(n)}66` } : {}}
              onClick={() => n!==0 && move(idx)}
            >
              {n !== 0 && <span>{n}</span>}
            </div>
          ))}
        </div>

        <button className="sp-btn" onClick={shuffle}>🔀 Shuffle</button>
      </div>
    </>
  )
}

function SC({ label, value, color }) {
  return (
    <div className="sp-chip" style={{ '--cc': color }}>
      <span className="sp-chip-label">{label}</span>
      <span className="sp-chip-val">{value}</span>
    </div>
  )
}

const SP_STYLES = `
  @keyframes sp-orb { 0%,100%{transform:translate(0,0)} 40%{transform:translate(20px,-15px)} 70%{transform:translate(-12px,8px)} }
  @keyframes sp-moved { 0%{transform:scale(1)} 40%{transform:scale(1.12)} 100%{transform:scale(1)} }
  @keyframes sp-done { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
  @keyframes sp-win-in { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
  @keyframes sp-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  .sp-root { position:relative;display:flex;flex-direction:column;align-items:center;gap:14px;padding:24px 16px 32px;overflow:hidden; }
  .sp-orb { position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none;z-index:0;animation:sp-orb 9s ease-in-out infinite; }
  .sp-orb-1 { width:240px;height:240px;background:rgba(139,92,246,0.12);top:-50px;left:-40px; }
  .sp-orb-2 { width:200px;height:200px;background:rgba(6,182,212,0.1);bottom:-40px;right:-40px;animation-delay:-4s; }

  .sp-stats { position:relative;z-index:1;display:flex;gap:12px;animation:sp-in 0.4s ease; }
  .sp-chip { display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 18px;border-radius:14px;background:rgba(15,23,42,0.65);border:1px solid rgba(139,92,246,0.22);backdrop-filter:blur(10px); }
  .sp-chip-label { font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b; }
  .sp-chip-val { font-size:22px;font-weight:800;color:var(--cc); }

  .sp-win { position:relative;z-index:1;padding:12px 24px;border-radius:16px;background:rgba(74,222,128,0.15);border:1.5px solid rgba(74,222,128,0.4);font-size:14px;font-weight:700;color:#4ade80;animation:sp-win-in 0.4s cubic-bezier(0.34,1.2,0.64,1); }

  .sp-board { position:relative;z-index:1;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:12px;border-radius:20px;background:rgba(15,23,42,0.8);border:1.5px solid rgba(139,92,246,0.22);backdrop-filter:blur(14px);width:100%;max-width:340px;box-shadow:0 12px 40px rgba(0,0,0,0.4); }
  .sp-tile { aspect-ratio:1;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:#fff;cursor:pointer;transition:transform 0.15s ease,box-shadow 0.15s ease;user-select:none; }
  .sp-tile:hover:not(.sp-tile--empty) { transform:scale(1.06);filter:brightness(1.15); }
  .sp-tile--empty { background:transparent !important;box-shadow:none !important;cursor:default; }
  .sp-tile--moved { animation:sp-moved 0.2s ease; }
  .sp-tile--done { animation:sp-done 0.5s ease; }

  .sp-btn { position:relative;z-index:1;padding:12px 28px;border-radius:14px;background:linear-gradient(135deg,#8b5cf6,#06b6d4);border:none;color:#fff;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 6px 18px rgba(139,92,246,0.4);transition:all 0.25s ease; }
  .sp-btn:hover { transform:translateY(-3px);box-shadow:0 10px 26px rgba(139,92,246,0.55); }
`
