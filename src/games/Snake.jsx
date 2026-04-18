import { useState, useEffect, useRef, useCallback } from 'react'

const CELL_SZ = 20

export default function Snake() {
  const canvasRef = useRef(null)
  const stateRef  = useRef(null)
  const rafRef    = useRef(null)
  const lastRef   = useRef(0)
  const [score, setScore]    = useState(0)
  const [bestScore, setBest] = useState(0)
  const [phase, setPhase]    = useState('idle') // idle | playing | dead
  const [displayScore, setDS] = useState(0)

  const W = 20, H = 20

  const initState = () => ({
    snake:  [{x:10,y:10},{x:9,y:10},{x:8,y:10}],
    dir:    {x:1,y:0},
    next:   {x:1,y:0},
    food:   randFood([{x:10,y:10}]),
    alive:  true,
    score:  0,
    speed:  180,
  })

  function randFood(snake) {
    let f
    do { f = {x:Math.floor(Math.random()*W),y:Math.floor(Math.random()*H)} }
    while (snake.some(s=>s.x===f.x&&s.y===f.y))
    return f
  }

  const draw = useCallback((s) => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    const w = c.width, h = c.height

    ctx.clearRect(0,0,w,h)

    // grid
    ctx.strokeStyle = 'rgba(139,92,246,0.06)'
    ctx.lineWidth = 0.5
    for(let x=0;x<W;x++){for(let y=0;y<H;y++){ctx.strokeRect(x*CELL_SZ,y*CELL_SZ,CELL_SZ,CELL_SZ)}}

    // food
    const f = s.food
    ctx.save()
    ctx.shadowBlur = 20
    ctx.shadowColor = '#f87171'
    ctx.fillStyle = '#f87171'
    ctx.beginPath()
    ctx.arc(f.x*CELL_SZ+CELL_SZ/2, f.y*CELL_SZ+CELL_SZ/2, CELL_SZ*0.38, 0, Math.PI*2)
    ctx.fill()
    ctx.restore()

    // snake
    s.snake.forEach((seg, i) => {
      const isHead = i === 0
      const t = i / s.snake.length
      const r = 2 + (isHead ? 2 : 0)
      ctx.save()
      ctx.shadowBlur = isHead ? 16 : 6
      ctx.shadowColor = isHead ? '#4ade80' : '#34d399'
      const g = ctx.createLinearGradient(seg.x*CELL_SZ,seg.y*CELL_SZ,(seg.x+1)*CELL_SZ,(seg.y+1)*CELL_SZ)
      g.addColorStop(0, isHead ? '#4ade80' : `hsl(${155+t*30},80%,${50-t*18}%)`)
      g.addColorStop(1, isHead ? '#22c55e' : '#166534')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.roundRect(seg.x*CELL_SZ+1, seg.y*CELL_SZ+1, CELL_SZ-2, CELL_SZ-2, r)
      ctx.fill()
      ctx.restore()

      if (isHead) {
        ctx.fillStyle = '#fff'
        const ex = seg.x*CELL_SZ + (s.dir.x===1?14:s.dir.x===-1?5:8)
        const ey = seg.y*CELL_SZ + (s.dir.y===1?14:s.dir.y===-1?5:8)
        ctx.beginPath(); ctx.arc(ex,ey,2,0,Math.PI*2); ctx.fill()
      }
    })
  }, [])

  const step = useCallback((ts) => {
    const s = stateRef.current
    if (!s || !s.alive) return
    if (ts - lastRef.current < s.speed) { rafRef.current = requestAnimationFrame(step); return }
    lastRef.current = ts

    s.dir = { ...s.next }
    const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y }

    if (head.x<0||head.x>=W||head.y<0||head.y>=H || s.snake.some(seg=>seg.x===head.x&&seg.y===head.y)) {
      s.alive = false
      setPhase('dead')
      setBest(b => Math.max(b, s.score))
      draw(s)
      return
    }

    const ateFood = head.x===s.food.x && head.y===s.food.y
    s.snake = [head, ...s.snake]
    if (!ateFood) s.snake.pop()
    else { s.food = randFood(s.snake); s.score++; s.speed = Math.max(80, s.speed-3); setDS(s.score) }

    draw(s)
    rafRef.current = requestAnimationFrame(step)
  }, [draw])

  const startGame = () => {
    cancelAnimationFrame(rafRef.current)
    const s = initState()
    stateRef.current = s
    setScore(0); setDS(0); setPhase('playing')
    lastRef.current = 0
    rafRef.current = requestAnimationFrame(step)
  }

  useEffect(() => {
    const onKey = (e) => {
      if (!stateRef.current) return
      const s = stateRef.current
      const d = s.dir
      if(e.key==='ArrowUp'    && d.y!==1)  s.next={x:0,y:-1}
      if(e.key==='ArrowDown'  && d.y!==-1) s.next={x:0,y:1}
      if(e.key==='ArrowLeft'  && d.x!==1)  s.next={x:-1,y:0}
      if(e.key==='ArrowRight' && d.x!==-1) s.next={x:1,y:0}
    }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); cancelAnimationFrame(rafRef.current) }
  }, [])

  const dirBtn = (nx, ny) => {
    const s = stateRef.current
    if (!s) return
    const d = s.dir
    if (ny===-1 && d.y!==1)  s.next={x:0,y:-1}
    if (ny===1  && d.y!==-1) s.next={x:0,y:1}
    if (nx===-1 && d.x!==1)  s.next={x:-1,y:0}
    if (nx===1  && d.x!==-1) s.next={x:1,y:0}
  }

  return (
    <>
      <style>{SNK_STYLES}</style>
      <div className="snk-root">
        <div className="snk-orb snk-orb-1"/><div className="snk-orb snk-orb-2"/>

        <div className="snk-stats">
          <SC label="Score" value={displayScore} color="#4ade80"/>
          <SC label="Best"  value={bestScore}    color="#fbbf24"/>
          {phase === 'dead' && <div className="snk-badge-dead">💀 Game Over</div>}
        </div>

        <div className="snk-canvas-wrap">
          <canvas ref={canvasRef} width={W*CELL_SZ} height={H*CELL_SZ} className="snk-canvas"/>
          {phase !== 'playing' && (
            <div className="snk-overlay">
              {phase === 'idle' ? (
                <div className="snk-overlay-content">
                  <span className="snk-overlay-icon">🐍</span>
                  <p className="snk-overlay-msg">Use arrow keys or buttons below</p>
                  <button className="snk-btn" onClick={startGame}>▶ Start Game</button>
                </div>
              ) : (
                <div className="snk-overlay-content">
                  <span className="snk-overlay-icon">💀</span>
                  <p className="snk-overlay-score">Score: {displayScore}</p>
                  {displayScore >= bestScore && displayScore > 0 && <p className="snk-overlay-best">🏆 New Best!</p>}
                  <button className="snk-btn" onClick={startGame}>🔄 Play Again</button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="snk-arrows">
          <button className="snk-arrow" onClick={()=>dirBtn(0,-1)}>↑</button>
          <div style={{display:'flex',gap:'6px'}}>
            <button className="snk-arrow" onClick={()=>dirBtn(-1,0)}>←</button>
            <button className="snk-arrow" onClick={()=>dirBtn(0,1)}>↓</button>
            <button className="snk-arrow" onClick={()=>dirBtn(1,0)}>→</button>
          </div>
        </div>
      </div>
    </>
  )
}

function SC({label,value,color}){return<div className="snk-chip" style={{'--cc':color}}><span className="snk-chip-label">{label}</span><span className="snk-chip-val">{value}</span></div>}

const SNK_STYLES=`
  @keyframes snk-orb{0%,100%{transform:translate(0,0)}40%{transform:translate(20px,-15px)}70%{transform:translate(-12px,8px)}}
  @keyframes snk-overlay{from{opacity:0}to{opacity:1}}

  .snk-root{position:relative;display:flex;flex-direction:column;align-items:center;gap:12px;padding:24px 16px 32px;overflow:hidden;}
  .snk-orb{position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none;z-index:0;animation:snk-orb 9s ease-in-out infinite;}
  .snk-orb-1{width:240px;height:240px;background:rgba(74,222,128,0.12);top:-50px;left:-40px;}
  .snk-orb-2{width:200px;height:200px;background:rgba(139,92,246,0.1);bottom:-40px;right:-40px;animation-delay:-4s;}

  .snk-stats{position:relative;z-index:1;display:flex;align-items:center;gap:10px;}
  .snk-chip{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 16px;border-radius:14px;background:rgba(15,23,42,0.65);border:1px solid rgba(139,92,246,0.22);backdrop-filter:blur(10px);}
  .snk-chip-label{font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;}
  .snk-chip-val{font-size:20px;font-weight:800;color:var(--cc);}
  .snk-badge-dead{padding:6px 14px;border-radius:12px;background:rgba(248,113,113,0.15);border:1px solid rgba(248,113,113,0.3);color:#f87171;font-size:13px;font-weight:700;}

  .snk-canvas-wrap{position:relative;z-index:1;border-radius:16px;overflow:hidden;border:2px solid rgba(139,92,246,0.25);box-shadow:0 12px 40px rgba(0,0,0,0.5);}
  .snk-canvas{display:block;background:rgba(5,10,20,0.95);}
  .snk-overlay{position:absolute;inset:0;background:rgba(5,10,20,0.85);display:flex;align-items:center;justify-content:center;animation:snk-overlay 0.3s ease;backdrop-filter:blur(4px);}
  .snk-overlay-content{display:flex;flex-direction:column;align-items:center;gap:10px;}
  .snk-overlay-icon{font-size:52px;}
  .snk-overlay-msg{font-size:13px;color:#64748b;text-align:center;}
  .snk-overlay-score{font-size:28px;font-weight:800;color:#a78bfa;}
  .snk-overlay-best{font-size:15px;font-weight:700;color:#fbbf24;}

  .snk-arrows{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:6px;}
  .snk-arrow{width:44px;height:44px;border-radius:12px;background:rgba(139,92,246,0.2);border:1.5px solid rgba(139,92,246,0.35);color:#a78bfa;font-size:17px;cursor:pointer;transition:all 0.15s ease;font-weight:700;}
  .snk-arrow:hover{background:rgba(139,92,246,0.4);transform:scale(1.1);}
  .snk-arrow:active{transform:scale(0.9);}

  .snk-btn{padding:12px 28px;border-radius:14px;background:linear-gradient(135deg,#8b5cf6,#06b6d4);border:none;color:#fff;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 6px 18px rgba(139,92,246,0.4);transition:all 0.25s ease;}
  .snk-btn:hover{transform:translateY(-3px);box-shadow:0 10px 26px rgba(139,92,246,0.55);}
`
