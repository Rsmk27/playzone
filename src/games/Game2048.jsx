import { useState, useEffect } from 'react'

const TILE_COLORS = {
  2:    { bg: '#eee4da', color: '#776e65' },
  4:    { bg: '#ede0c8', color: '#776e65' },
  8:    { bg: '#f2b179', color: '#fff' },
  16:   { bg: '#f59563', color: '#fff' },
  32:   { bg: '#f67c5f', color: '#fff' },
  64:   { bg: '#f65e3b', color: '#fff' },
  128:  { bg: '#edcf72', color: '#fff' },
  256:  { bg: '#edcc61', color: '#fff' },
  512:  { bg: '#edc850', color: '#fff' },
  1024: { bg: '#edc53f', color: '#fff' },
  2048: { bg: '#edc22e', color: '#fff' },
}

function addRandom(g) {
  const empty = []
  for(let i=0;i<4;i++) for(let j=0;j<4;j++) if(g[i][j]===0) empty.push({i,j})
  if(!empty.length) return g
  const {i,j} = empty[Math.floor(Math.random()*empty.length)]
  const ng = g.map(r=>[...r])
  ng[i][j] = Math.random()<0.9?2:4
  return ng
}

function init() {
  let g = Array(4).fill().map(()=>Array(4).fill(0))
  g = addRandom(g); g = addRandom(g)
  return g
}

function slide(row) {
  let r = row.filter(x=>x), score = 0
  for(let i=0;i<r.length-1;i++) {
    if(r[i]===r[i+1]) { r[i]*=2; score+=r[i]; r.splice(i+1,1) }
  }
  while(r.length<4) r.push(0)
  return { row: r, score }
}

function move(g, dir, mutate) {
  let moved=false, totalScore=0
  const ng = g.map(r=>[...r])
  if(dir==='left'||dir==='right') {
    for(let i=0;i<4;i++){
      let row = ng[i]; if(dir==='right') row=row.slice().reverse()
      const {row:sr,score} = slide(row)
      if(dir==='right') sr.reverse()
      if(JSON.stringify(ng[i])!==JSON.stringify(sr)) moved=true
      ng[i]=sr; totalScore+=score
    }
  } else {
    for(let j=0;j<4;j++){
      let col=[]; for(let i=0;i<4;i++) col.push(ng[i][j])
      if(dir==='down') col.reverse()
      const {row:sc,score}=slide(col)
      if(dir==='down') sc.reverse()
      for(let i=0;i<4;i++){if(ng[i][j]!==sc[i])moved=true;ng[i][j]=sc[i]}
      totalScore+=score
    }
  }
  return { grid: moved?addRandom(ng):g, score: totalScore, moved }
}

export default function Game2048() {
  const [grid, setGrid]   = useState(init)
  const [score, setScore] = useState(0)
  const [best, setBest]   = useState(0)
  const [won, setWon]     = useState(false)

  const doMove = (dir) => {
    setGrid(prev => {
      const {grid:ng,score:ds,moved} = move(prev,dir)
      if(moved) {
        setScore(s=>{const ns=s+ds;setBest(b=>Math.max(b,ns));return ns})
        if(ng.flat().includes(2048)) setWon(true)
      }
      return ng
    })
  }

  const newGame = () => { setGrid(init()); setScore(0); setWon(false) }

  useEffect(() => {
    const h = (e) => {
      if(e.key==='ArrowLeft')  doMove('left')
      if(e.key==='ArrowRight') doMove('right')
      if(e.key==='ArrowUp')    doMove('up')
      if(e.key==='ArrowDown')  doMove('down')
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const max = Math.max(...grid.flat())

  return (
    <>
      <style>{T48_STYLES}</style>
      <div className="t48-root">
        <div className="t48-orb t48-orb-1" /><div className="t48-orb t48-orb-2" />

        {/* header */}
        <div className="t48-header">
          <div className="t48-score-group">
            <div className="t48-score-box">
              <span className="t48-score-label">Score</span>
              <span className="t48-score-val">{score}</span>
            </div>
            <div className="t48-score-box">
              <span className="t48-score-label">Best</span>
              <span className="t48-score-val t48-score-best">{best}</span>
            </div>
          </div>
          {max >= 128 && (
            <div className="t48-max-badge" style={{ background: TILE_COLORS[max]?.bg||'#a78bfa', color: TILE_COLORS[max]?.color||'#fff' }}>
              {max}
            </div>
          )}
        </div>

        {won && (
          <div className="t48-win">🎉 You reached 2048! Keep going for a higher score.</div>
        )}

        {/* grid */}
        <div className="t48-grid">
          {grid.map((row,i)=>row.map((cell,j) => {
            const tc = TILE_COLORS[cell]
            return (
              <div
                key={`${i}-${j}`}
                className={`t48-tile ${cell?'t48-tile--filled':''}`}
                style={tc ? {
                  background: tc.bg,
                  color: tc.color,
                  boxShadow: cell>=128 ? `0 0 18px ${tc.bg}99` : undefined,
                  fontSize: cell>=1024?'1.6rem':cell>=128?'2rem':'2.4rem',
                } : {}}
              >
                {cell || ''}
              </div>
            )
          }))}
        </div>

        {/* arrow controls */}
        <div className="t48-arrows">
          <button className="t48-arrow" onClick={()=>doMove('up')}>↑</button>
          <div style={{display:'flex',gap:'6px'}}>
            <button className="t48-arrow" onClick={()=>doMove('left')}>←</button>
            <button className="t48-arrow" onClick={()=>doMove('down')}>↓</button>
            <button className="t48-arrow" onClick={()=>doMove('right')}>→</button>
          </div>
        </div>

        <button className="t48-btn" onClick={newGame}>🔄 New Game</button>
        <span className="t48-hint">Use arrow keys or buttons to play</span>
      </div>
    </>
  )
}

const T48_STYLES = `
  @keyframes t48-orb { 0%,100%{transform:translate(0,0)} 40%{transform:translate(20px,-15px)} 70%{transform:translate(-12px,8px)} }
  @keyframes t48-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes t48-tile-in { from{transform:scale(0.5);opacity:0} to{transform:scale(1);opacity:1} }

  .t48-root { position:relative;display:flex;flex-direction:column;align-items:center;gap:12px;padding:24px 16px 32px;overflow:hidden; }
  .t48-orb { position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none;z-index:0;animation:t48-orb 9s ease-in-out infinite; }
  .t48-orb-1 { width:240px;height:240px;background:rgba(237,204,97,0.12);top:-50px;left:-40px; }
  .t48-orb-2 { width:200px;height:200px;background:rgba(139,92,246,0.1);bottom:-40px;right:-40px;animation-delay:-4s; }

  .t48-header { position:relative;z-index:1;display:flex;align-items:center;gap:12px;width:100%;max-width:360px;animation:t48-in 0.4s ease; }
  .t48-score-group { display:flex;gap:8px;flex:1; }
  .t48-score-box { padding:8px 16px;border-radius:12px;background:rgba(15,23,42,0.65);border:1px solid rgba(139,92,246,0.22);backdrop-filter:blur(10px);display:flex;flex-direction:column;align-items:center;gap:2px;flex:1; }
  .t48-score-label { font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b; }
  .t48-score-val { font-size:20px;font-weight:800;color:#a78bfa; }
  .t48-score-best { color:#fbbf24; }
  .t48-max-badge { padding:6px 14px;border-radius:12px;font-size:18px;font-weight:900; }

  .t48-win { position:relative;z-index:1;padding:10px 20px;border-radius:16px;background:rgba(237,204,97,0.15);border:1.5px solid rgba(237,204,97,0.4);font-size:13px;font-weight:700;color:#edc561;max-width:360px;text-align:center; }

  .t48-grid { position:relative;z-index:1;display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:12px;border-radius:18px;background:rgba(15,23,42,0.85);border:2px solid rgba(139,92,246,0.22);backdrop-filter:blur(14px);width:100%;max-width:360px;box-shadow:0 12px 40px rgba(0,0,0,0.5); }
  .t48-tile { aspect-ratio:1;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:900;background:rgba(255,255,255,0.05);transition:all 0.1s ease; }
  .t48-tile--filled { animation:t48-tile-in 0.15s ease; }

  .t48-arrows { position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:6px; }
  .t48-arrow { width:44px;height:44px;border-radius:12px;background:rgba(139,92,246,0.25);border:1.5px solid rgba(139,92,246,0.4);color:#a78bfa;font-size:18px;cursor:pointer;transition:all 0.15s ease;font-weight:700; }
  .t48-arrow:hover { background:rgba(139,92,246,0.45);transform:scale(1.1); }
  .t48-arrow:active { transform:scale(0.92); }

  .t48-btn { position:relative;z-index:1;padding:12px 28px;border-radius:14px;background:linear-gradient(135deg,#8b5cf6,#06b6d4);border:none;color:#fff;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 6px 18px rgba(139,92,246,0.4);transition:all 0.25s ease; }
  .t48-btn:hover { transform:translateY(-3px);box-shadow:0 10px 26px rgba(139,92,246,0.55); }
  .t48-hint { position:relative;z-index:1;font-size:11px;color:#475569; }
`
