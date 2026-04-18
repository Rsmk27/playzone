import { useState, useEffect } from 'react'

const ROWS = 6, COLS = 7
const MINES = 10

function initGrid() {
  const g = Array(ROWS).fill().map(() => Array(COLS).fill(0))
  let placed = 0
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS)
    const c = Math.floor(Math.random() * COLS)
    if (g[r][c] !== 'M') { g[r][c] = 'M'; placed++ }
  }
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (g[r][c] === 'M') continue
    let n = 0
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const nr = r+dr, nc = c+dc
      if (nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&g[nr][nc]==='M') n++
    }
    g[r][c] = n
  }
  return g
}

const NUM_COLORS = ['', '#60a5fa','#4ade80','#f87171','#818cf8','#f472b6','#2dd4bf','#fbbf24','#a78bfa']

export default function Minesweeper() {
  const [grid, setGrid]       = useState([])
  const [rev, setRev]         = useState([])
  const [flags, setFlags]     = useState([])
  const [over, setOver]       = useState(false)
  const [win, setWin]         = useState(false)
  const [time, setTime]       = useState(0)
  const [bestTime, setBest]   = useState(null)
  const [exploded, setExplod] = useState(null)

  const init = () => {
    const g = initGrid()
    setGrid(g)
    setRev(Array(ROWS).fill().map(() => Array(COLS).fill(false)))
    setFlags(Array(ROWS).fill().map(() => Array(COLS).fill(false)))
    setOver(false)
    setWin(false)
    setTime(0)
    setExplod(null)
  }

  useEffect(() => { init() }, [])
  useEffect(() => {
    if (over || win || grid.length === 0) return
    const t = setInterval(() => setTime(n => n + 1), 1000)
    return () => clearInterval(t)
  }, [over, win, grid])

  const reveal = (r, c) => {
    if (over || rev[r][c] || flags[r][c]) return
    const newRev = rev.map(row => [...row])
    if (grid[r][c] === 'M') {
      setExplod(`${r}-${c}`)
      newRev.forEach((row, ri) => row.forEach((_, ci) => { if (grid[ri][ci] === 'M') newRev[ri][ci] = true }))
      setRev(newRev)
      setOver(true)
      return
    }
    const flood = (rr, cc) => {
      if (rr<0||rr>=ROWS||cc<0||cc>=COLS||newRev[rr][cc]||flags[rr][cc]) return
      newRev[rr][cc] = true
      if (grid[rr][cc] === 0) for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) flood(rr+dr,cc+dc)
    }
    flood(r, c)
    setRev(newRev)
    const remaining = newRev.flat().filter((v,i) => !v && grid.flat()[i] !== 'M').length
    if (remaining === 0) {
      setWin(true)
      setOver(true)
      setBest(b => b === null ? time : Math.min(b, time))
    }
  }

  const flag = (e, r, c) => {
    e.preventDefault()
    if (over || rev[r][c]) return
    const nf = flags.map(row => [...row])
    nf[r][c] = !nf[r][c]
    setFlags(nf)
  }

  const flagsUsed = flags.flat().filter(Boolean).length
  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  return (
    <>
      <style>{MS_STYLES}</style>
      <div className="ms-root">
        <div className="ms-orb ms-orb-1" /><div className="ms-orb ms-orb-2" />

        {/* header */}
        <div className="ms-header">
          <div className="ms-hud">
            <span className="ms-hud-icon">💣</span>
            <span className="ms-hud-val">{MINES - flagsUsed}</span>
          </div>
          <div className={`ms-status ${win ? 'ms-status--win' : over && !win ? 'ms-status--lose' : ''}`}>
            {win ? '🎉 Cleared!' : over ? '💥 Boom!' : '🎮 Playing'}
          </div>
          <div className="ms-hud">
            <span className="ms-hud-icon">⏱</span>
            <span className="ms-hud-val">{fmt(time)}</span>
          </div>
        </div>

        {bestTime !== null && (
          <div className="ms-best">🏆 Best: {fmt(bestTime)}</div>
        )}

        {/* grid */}
        <div className="ms-grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
          {grid.map((row, r) => row.map((cell, c) => {
            const isRev   = rev[r] && rev[r][c]
            const isFlagged = flags[r] && flags[r][c]
            const isMine  = cell === 'M'
            const isExpl  = exploded === `${r}-${c}`
            return (
              <div
                key={`${r}-${c}`}
                className={`ms-cell
                  ${isRev ? 'ms-cell--rev' : 'ms-cell--hidden'}
                  ${isRev && isMine ? (isExpl ? 'ms-cell--exploded' : 'ms-cell--mine') : ''}
                  ${!isRev && isFlagged ? 'ms-cell--flagged' : ''}
                `}
                onClick={() => reveal(r, c)}
                onContextMenu={e => flag(e, r, c)}
              >
                {isRev
                  ? (isMine ? '💣' : cell > 0 ? <span style={{ color: NUM_COLORS[cell] }}>{cell}</span> : '')
                  : (isFlagged ? '🚩' : '')}
              </div>
            )
          }))}
        </div>

        <button className="ms-btn" onClick={init}>🔄 New Game</button>
      </div>
    </>
  )
}

const MS_STYLES = `
  @keyframes ms-orb { 0%,100%{transform:translate(0,0)} 40%{transform:translate(20px,-15px)} 70%{transform:translate(-12px,8px)} }
  @keyframes ms-explode { 0%{transform:scale(1)} 30%{transform:scale(1.4)} 60%{transform:scale(0.9)} 100%{transform:scale(1)} }
  @keyframes ms-flag-in { from{transform:scale(0)} to{transform:scale(1)} }
  @keyframes ms-rev-in { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
  @keyframes ms-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  .ms-root { position:relative;display:flex;flex-direction:column;align-items:center;gap:14px;padding:24px 16px 32px;overflow:hidden; }
  .ms-orb { position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none;z-index:0;animation:ms-orb 9s ease-in-out infinite; }
  .ms-orb-1 { width:240px;height:240px;background:rgba(248,113,113,0.1);top:-50px;left:-40px; }
  .ms-orb-2 { width:200px;height:200px;background:rgba(139,92,246,0.1);bottom:-40px;right:-40px;animation-delay:-4s; }

  .ms-header { position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;width:100%;max-width:380px;padding:10px 16px;border-radius:16px;background:rgba(15,23,42,0.7);border:1px solid rgba(139,92,246,0.22);backdrop-filter:blur(14px);animation:ms-in 0.4s ease; }
  .ms-hud { display:flex;align-items:center;gap:6px; }
  .ms-hud-icon { font-size:18px; }
  .ms-hud-val { font-size:20px;font-weight:800;color:#f1f5f9;font-variant-numeric:tabular-nums; }
  .ms-status { font-size:14px;font-weight:700;color:#64748b;padding:4px 12px;border-radius:20px;background:rgba(255,255,255,0.05); }
  .ms-status--win { color:#4ade80;background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.3); }
  .ms-status--lose { color:#f87171;background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.3); }
  .ms-best { position:relative;z-index:1;font-size:12px;color:#fbbf24;font-weight:600; }

  .ms-grid { position:relative;z-index:1;display:grid;gap:3px;padding:10px;border-radius:18px;background:rgba(15,23,42,0.8);border:1.5px solid rgba(139,92,246,0.22);backdrop-filter:blur(10px);width:100%;max-width:380px;box-shadow:0 12px 40px rgba(0,0,0,0.4); }
  .ms-cell { aspect-ratio:1;min-width:0;display:flex;align-items:center;justify-content:center;border-radius:8px;font-size:16px;font-weight:800;cursor:pointer;user-select:none;transition:all 0.15s ease; }
  .ms-cell--hidden { background:rgba(139,92,246,0.18);border:1.5px outset rgba(255,255,255,0.12); }
  .ms-cell--hidden:hover { background:rgba(139,92,246,0.32);transform:scale(1.06); }
  .ms-cell--rev { background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.07);animation:ms-rev-in 0.2s ease; }
  .ms-cell--mine { background:rgba(248,113,113,0.2); }
  .ms-cell--exploded { background:rgba(248,113,113,0.5);animation:ms-explode 0.4s ease; }
  .ms-cell--flagged { background:rgba(251,191,36,0.15); }
  .ms-cell--flagged > * { animation:ms-flag-in 0.2s ease; }

  .ms-btn { position:relative;z-index:1;padding:12px 28px;border-radius:14px;background:linear-gradient(135deg,#8b5cf6,#06b6d4);border:none;color:#fff;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 6px 18px rgba(139,92,246,0.4);transition:all 0.25s ease; }
  .ms-btn:hover { transform:translateY(-3px);box-shadow:0 10px 26px rgba(139,92,246,0.55); }
`
