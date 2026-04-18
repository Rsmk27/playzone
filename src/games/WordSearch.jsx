import { useState, useEffect, useCallback } from 'react'

export default function WordSearch() {
  const WORDS = ['CAT','DOG','BIRD','FISH','CODE','GAME','PLAY','ZONE','WORD','FIND']
  const [grid, setGrid]           = useState([])
  const [found, setFound]         = useState(new Set())
  const [selecting, setSelecting] = useState(false)
  const [selected, setSelected]   = useState([])
  const [positions, setPositions] = useState({})
  const [elapsed, setElapsed]     = useState(0)
  const [startTime, setStart]     = useState(null)
  const [flashWord, setFlash]     = useState(null)

  const canPlace = (w,r,c,d,g) => {
    const dirs=[[0,1],[1,0],[1,1],[1,-1]]
    const[dr,dc]=dirs[d]
    for(let i=0;i<w.length;i++){
      const nr=r+i*dr,nc=c+i*dc
      if(nr<0||nr>=10||nc<0||nc>=10) return false
      if(g[nr][nc]&&g[nr][nc]!==w[i]) return false
    }
    return true
  }

  const newGame = useCallback(() => {
    const g = Array(10).fill().map(()=>Array(10).fill(''))
    const wp = {}
    const dirs = [[0,1],[1,0],[1,1],[1,-1]]
    WORDS.forEach(w => {
      let placed=false
      while(!placed){
        const d=Math.floor(Math.random()*dirs.length)
        const r=Math.floor(Math.random()*10),c=Math.floor(Math.random()*10)
        if(canPlace(w,r,c,d,g)){
          const[dr,dc]=dirs[d],pos=[]
          for(let i=0;i<w.length;i++){g[r+i*dr][c+i*dc]=w[i];pos.push(`${r+i*dr}-${c+i*dc}`)}
          wp[w]=pos;placed=true
        }
      }
    })
    for(let r=0;r<10;r++) for(let c=0;c<10;c++)
      if(!g[r][c]) g[r][c]=String.fromCharCode(65+Math.floor(Math.random()*26))
    setGrid(g);setPositions(wp);setFound(new Set());setSelected([]);setSelecting(false)
    setElapsed(0);setStart(Date.now());setFlash(null)
  },[])

  useEffect(()=>{newGame()},[newGame])
  useEffect(()=>{
    if(!startTime||found.size>=WORDS.length) return
    const t=setInterval(()=>setElapsed(Math.floor((Date.now()-startTime)/1000)),1000)
    return()=>clearInterval(t)
  },[startTime,found.size])

  const endSel = () => {
    if(!selecting) return
    setSelecting(false)
    const word=selected.map(p=>{const[r,c]=p.split('-').map(Number);return grid[r][c]}).join('')
    const rev=word.split('').reverse().join('')
    let foundW=null
    WORDS.forEach(w=>{
      if((w===word||w===rev)&&!found.has(w)){
        const pos=positions[w]
        const match=selected.every(c=>pos.includes(c))&&selected.length===pos.length
        if(match)foundW=w
      }
    })
    if(foundW){
      setFound(prev=>{const n=new Set(prev);n.add(foundW);return n})
      setFlash(foundW)
      setTimeout(()=>setFlash(null),600)
    }
    setSelected([])
  }

  const isSel=(r,c)=>selected.includes(`${r}-${c}`)
  const isFound=(r,c)=>Array.from(found).some(w=>positions[w]?.includes(`${r}-${c}`))

  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  return (
    <>
      <style>{WS_STYLES}</style>
      <div className="ws-root">
        <div className="ws-orb ws-orb-1"/><div className="ws-orb ws-orb-2"/>

        {/* header */}
        <div className="ws-header">
          <div className="ws-chip" style={{'--cc':'#a78bfa'}}>
            <span className="ws-chip-label">Found</span>
            <span className="ws-chip-val">{found.size}/{WORDS.length}</span>
          </div>
          <div className="ws-chip" style={{'--cc':'#4ade80'}}>
            <span className="ws-chip-label">Time</span>
            <span className="ws-chip-val">{fmt(elapsed)}</span>
          </div>
        </div>

        {found.size===WORDS.length && (
          <div className="ws-win">🎉 All words found in {fmt(elapsed)}!</div>
        )}

        {/* grid */}
        <div
          className="ws-grid"
          onMouseLeave={endSel}
          onMouseUp={endSel}
        >
          {grid.map((row,r)=>row.map((ch,c)=>(
            <div
              key={`${r}-${c}`}
              className={`ws-cell ${isSel(r,c)?'ws-cell--sel':''} ${isFound(r,c)?'ws-cell--found':''}`}
              onMouseDown={()=>{setSelecting(true);setSelected([`${r}-${c}`])}}
              onMouseEnter={()=>{if(selecting&&!selected.includes(`${r}-${c}`))setSelected(p=>[...p,`${r}-${c}`])}}
            >{ch}</div>
          )))}
        </div>

        {/* word list */}
        <div className="ws-words">
          {WORDS.map(w=>(
            <div
              key={w}
              className={`ws-word ${found.has(w)?'ws-word--found':''} ${flashWord===w?'ws-word--flash':''}`}
            >{w}</div>
          ))}
        </div>

        <button className="ws-btn" onClick={newGame}>🔄 New Game</button>
      </div>
    </>
  )
}

const WS_STYLES=`
  @keyframes ws-orb{0%,100%{transform:translate(0,0)}40%{transform:translate(20px,-15px)}70%{transform:translate(-12px,8px)}}
  @keyframes ws-found-flash{0%{transform:scale(1)}30%{transform:scale(1.2)}100%{transform:scale(1)}}
  @keyframes ws-win-in{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
  @keyframes ws-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}

  .ws-root{position:relative;display:flex;flex-direction:column;align-items:center;gap:12px;padding:24px 16px 32px;overflow:hidden;}
  .ws-orb{position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none;z-index:0;animation:ws-orb 9s ease-in-out infinite;}
  .ws-orb-1{width:240px;height:240px;background:rgba(139,92,246,0.12);top:-50px;left:-40px;}
  .ws-orb-2{width:200px;height:200px;background:rgba(6,182,212,0.1);bottom:-40px;right:-40px;animation-delay:-4s;}

  .ws-header{position:relative;z-index:1;display:flex;gap:10px;animation:ws-in 0.4s ease;}
  .ws-chip{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 18px;border-radius:14px;background:rgba(15,23,42,0.65);border:1px solid rgba(139,92,246,0.22);backdrop-filter:blur(10px);}
  .ws-chip-label{font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;}
  .ws-chip-val{font-size:20px;font-weight:800;color:var(--cc);}

  .ws-win{position:relative;z-index:1;padding:10px 22px;border-radius:16px;background:rgba(74,222,128,0.15);border:1.5px solid rgba(74,222,128,0.35);font-size:14px;font-weight:700;color:#4ade80;animation:ws-win-in 0.4s ease;}

  .ws-grid{position:relative;z-index:1;display:grid;grid-template-columns:repeat(10,1fr);gap:3px;padding:10px;border-radius:18px;background:rgba(15,23,42,0.8);border:1.5px solid rgba(139,92,246,0.22);backdrop-filter:blur(14px);user-select:none;cursor:default;width:100%;max-width:380px;box-shadow:0 12px 40px rgba(0,0,0,0.4);}
  .ws-cell{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:6px;font-size:13px;font-weight:700;color:#475569;transition:all 0.12s ease;}
  .ws-cell--sel{background:rgba(251,191,36,0.3);color:#fbbf24;transform:scale(1.08);}
  .ws-cell--found{background:rgba(74,222,128,0.25);color:#4ade80;}

  .ws-words{position:relative;z-index:1;display:flex;flex-wrap:wrap;justify-content:center;gap:8px;max-width:380px;}
  .ws-word{padding:5px 12px;border-radius:20px;font-size:12px;font-weight:700;background:rgba(15,23,42,0.65);border:1.5px solid rgba(139,92,246,0.25);color:#64748b;transition:all 0.25s ease;}
  .ws-word--found{background:rgba(74,222,128,0.15);border-color:rgba(74,222,128,0.4);color:#4ade80;text-decoration:line-through;}
  .ws-word--flash{animation:ws-found-flash 0.5s ease;}

  .ws-btn{position:relative;z-index:1;padding:12px 28px;border-radius:14px;background:linear-gradient(135deg,#8b5cf6,#06b6d4);border:none;color:#fff;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 6px 18px rgba(139,92,246,0.4);transition:all 0.25s ease;}
  .ws-btn:hover{transform:translateY(-3px);box-shadow:0 10px 26px rgba(139,92,246,0.55);}
`
