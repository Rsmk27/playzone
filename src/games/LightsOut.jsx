import { useState, useEffect } from 'react'

export default function LightsOut() {
  const [grid, setGrid]   = useState(Array(5).fill().map(()=>Array(5).fill(false)))
  const [moves, setMoves] = useState(0)
  const [won, setWon]     = useState(false)
  const [best, setBest]   = useState(null)
  const [lastClick, setLastClick] = useState(null)

  const toggle = (r, c, g) => {
    const ng = g.map(row=>[...row])
    [[0,0],[0,1],[0,-1],[1,0],[-1,0]].forEach(([dr,dc])=>{
      const nr=r+dr,nc=c+dc
      if(nr>=0&&nr<5&&nc>=0&&nc<5) ng[nr][nc]=!ng[nr][nc]
    })
    return ng
  }

  const newGame = () => {
    let g = Array(5).fill().map(()=>Array(5).fill(false))
    for(let i=0;i<12;i++){
      const r=Math.floor(Math.random()*5),c=Math.floor(Math.random()*5)
      g = toggle(r,c,g)
    }
    setGrid(g)
    setMoves(0)
    setWon(false)
  }

  useEffect(() => { newGame() }, [])

  const click = (r, c) => {
    if (won) return
    const ng = toggle(r, c, grid)
    setGrid(ng)
    setMoves(m=>m+1)
    setLastClick(`${r}-${c}`)
    setTimeout(() => setLastClick(null), 300)
    if (ng.flat().every(cell=>!cell)) {
      setWon(true)
      setBest(b => b===null ? moves+1 : Math.min(b, moves+1))
    }
  }

  const litCount = grid.flat().filter(Boolean).length

  return (
    <>
      <style>{LO_STYLES}</style>
      <div className="lo-root">
        <div className="lo-orb lo-orb-1" /><div className="lo-orb lo-orb-2" />

        <div className="lo-stats">
          <SC label="Moves" value={moves} color="#fbbf24" />
          <SC label="Lit"   value={litCount} color="#f87171" />
          <SC label="Best"  value={best!==null?best:'—'} color="#4ade80" />
        </div>

        {won && (
          <div className="lo-win">🎉 All lights out in {moves} moves!{moves<=best?' 🏆 New best!':''}</div>
        )}

        <div className="lo-grid">
          {grid.map((row,r) => row.map((on,c) => (
            <div
              key={`${r}-${c}`}
              className={`lo-cell ${on?'lo-cell--on':'lo-cell--off'} ${won?'lo-cell--done':''} ${lastClick===`${r}-${c}`?'lo-cell--clicked':''}`}
              onClick={() => click(r,c)}
            >
              {on && <div className="lo-glow" />}
            </div>
          )))}
        </div>

        {/* progress bar */}
        <div className="lo-prog-wrap">
          <div className="lo-prog" style={{ width: `${(1-litCount/25)*100}%` }} />
        </div>
        <span className="lo-prog-label">{Math.round((1-litCount/25)*100)}% cleared</span>

        <button className="lo-btn" onClick={newGame}>🔄 New Game</button>
      </div>
    </>
  )
}

function SC({ label, value, color }) {
  return (
    <div className="lo-chip" style={{ '--cc': color }}>
      <span className="lo-chip-label">{label}</span>
      <span className="lo-chip-val">{value}</span>
    </div>
  )
}

const LO_STYLES = `
  @keyframes lo-orb { 0%,100%{transform:translate(0,0)} 40%{transform:translate(20px,-15px)} 70%{transform:translate(-12px,8px)} }
  @keyframes lo-glow-pulse { 0%,100%{opacity:0.5} 50%{opacity:0.9} }
  @keyframes lo-click { 0%{transform:scale(1)} 40%{transform:scale(0.88)} 100%{transform:scale(1)} }
  @keyframes lo-win-flash { 0%,100%{transform:scale(1)} 30%{transform:scale(1.08)} }
  @keyframes lo-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  .lo-root { position:relative;display:flex;flex-direction:column;align-items:center;gap:14px;padding:24px 16px 32px;overflow:hidden; }
  .lo-orb { position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none;z-index:0;animation:lo-orb 9s ease-in-out infinite; }
  .lo-orb-1 { width:240px;height:240px;background:rgba(251,191,36,0.12);top:-50px;left:-40px; }
  .lo-orb-2 { width:200px;height:200px;background:rgba(139,92,246,0.1);bottom:-40px;right:-40px;animation-delay:-4s; }

  .lo-stats { position:relative;z-index:1;display:flex;gap:10px;animation:lo-in 0.4s ease; }
  .lo-chip { display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 16px;border-radius:14px;background:rgba(15,23,42,0.65);border:1px solid rgba(139,92,246,0.22);backdrop-filter:blur(10px); }
  .lo-chip-label { font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b; }
  .lo-chip-val { font-size:22px;font-weight:800;color:var(--cc); }

  .lo-win { position:relative;z-index:1;padding:12px 24px;border-radius:16px;background:rgba(251,191,36,0.15);border:1.5px solid rgba(251,191,36,0.4);font-size:14px;font-weight:700;color:#fbbf24; }

  .lo-grid { position:relative;z-index:1;display:grid;grid-template-columns:repeat(5,1fr);gap:8px;padding:12px;border-radius:20px;background:rgba(15,23,42,0.8);border:1.5px solid rgba(139,92,246,0.22);backdrop-filter:blur(14px);width:100%;max-width:320px; }
  .lo-cell { aspect-ratio:1;border-radius:14px;cursor:pointer;position:relative;overflow:hidden;transition:all 0.2s ease; }
  .lo-cell--on  { background:#fbbf24;box-shadow:0 0 22px rgba(251,191,36,0.6); }
  .lo-cell--off { background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.07); }
  .lo-cell--off:hover { background:rgba(251,191,36,0.1);border-color:rgba(251,191,36,0.3); }
  .lo-cell--clicked { animation:lo-click 0.25s ease; }
  .lo-cell--done { animation:lo-win-flash 0.5s ease; }
  .lo-glow { position:absolute;inset:0;background:radial-gradient(circle,rgba(255,255,255,0.4),transparent 70%);animation:lo-glow-pulse 1.5s ease-in-out infinite; }

  .lo-prog-wrap { position:relative;z-index:1;width:100%;max-width:320px;height:6px;border-radius:6px;background:rgba(255,255,255,0.07); }
  .lo-prog { height:100%;border-radius:6px;background:linear-gradient(90deg,#8b5cf6,#fbbf24);transition:width 0.3s ease;box-shadow:0 0 8px rgba(139,92,246,0.5); }
  .lo-prog-label { position:relative;z-index:1;font-size:11px;color:#64748b; }

  .lo-btn { position:relative;z-index:1;padding:12px 28px;border-radius:14px;background:linear-gradient(135deg,#8b5cf6,#06b6d4);border:none;color:#fff;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 6px 18px rgba(139,92,246,0.4);transition:all 0.25s ease; }
  .lo-btn:hover { transform:translateY(-3px);box-shadow:0 10px 26px rgba(139,92,246,0.55); }
`
