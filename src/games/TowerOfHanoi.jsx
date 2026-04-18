import { useState } from 'react'

const COLORS = ['#f87171','#fb923c','#fbbf24','#4ade80','#60a5fa','#a78bfa','#f472b6','#34d399']

export default function TowerOfHanoi() {
  const [numDisks, setNum]   = useState(4)
  const [pegs, setPegs]      = useState(() => init(4))
  const [selected, setSel]   = useState(null)
  const [moves, setMoves]    = useState(0)
  const [minMoves, setMin]   = useState(15)
  const [won, setWon]        = useState(false)
  const [lastMove, setLast]  = useState(null)

  function init(n) {
    return [Array.from({length:n},(_,i)=>n-i), [], []]
  }

  const reset = (n=numDisks) => {
    setNum(n)
    setPegs(init(n))
    setSel(null)
    setMoves(0)
    setMin(Math.pow(2,n)-1)
    setWon(false)
    setLast(null)
  }

  const clickPeg = (pegIdx) => {
    if (won) return
    if (selected === null) {
      if (pegs[pegIdx].length === 0) return
      setSel(pegIdx)
    } else {
      if (selected === pegIdx) { setSel(null); return }
      const top = pegs[selected][pegs[selected].length-1]
      const target = pegs[pegIdx]
      if (target.length > 0 && target[target.length-1] < top) { setSel(null); return }
      const np = pegs.map(p=>[...p])
      np[pegIdx].push(np[selected].pop())
      setPegs(np)
      setMoves(m=>m+1)
      setLast(pegIdx)
      setSel(null)
      if (pegIdx === 2 && np[2].length === numDisks) setWon(true)
    }
  }

  const maxD = numDisks
  const efficiency = moves > 0 ? Math.round((minMoves / moves)*100) : 100

  return (
    <>
      <style>{TOH_STYLES}</style>
      <div className="toh-root">
        <div className="toh-orb toh-orb-1"/><div className="toh-orb toh-orb-2"/>

        {/* stats */}
        <div className="toh-stats">
          <SC label="Moves"   value={moves}     color="#a78bfa"/>
          <SC label="Min"     value={minMoves}  color="#4ade80"/>
          <SC label="Efficiency" value={`${efficiency}%`} color={efficiency>=90?'#4ade80':efficiency>=60?'#fbbf24':'#f87171'}/>
        </div>

        {won && (
          <div className="toh-win">🎉 Solved in {moves} moves! {moves===minMoves?'Perfect! 🏆':''}</div>
        )}

        {/* pegs */}
        <div className="toh-pegs">
          {pegs.map((peg, pi) => (
            <div
              key={pi}
              className={`toh-peg-wrap ${selected===pi?'toh-peg-wrap--sel':''}  ${lastMove===pi?'toh-peg-wrap--last':''}`}
              onClick={() => clickPeg(pi)}
            >
              <span className="toh-peg-label">{['A','B','C'][pi]}</span>
              <div className="toh-disk-area">
                {[...Array(maxD)].map((_, slotIdx) => {
                  const di = slotIdx - (maxD - peg.length)
                  const disk = di >= 0 ? peg[di] : null
                  return (
                    <div key={slotIdx} className="toh-slot">
                      {disk !== null && (
                        <div
                          className="toh-disk"
                          style={{
                            width: `${20 + (disk/maxD)*68}%`,
                            background: COLORS[(disk-1) % COLORS.length],
                            boxShadow: `0 4px 12px ${COLORS[(disk-1)%COLORS.length]}66`,
                          }}
                        >
                          <span className="toh-disk-n">{disk}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="toh-pole"/>
              <div className="toh-base"/>
            </div>
          ))}
        </div>

        {/* disk count selector */}
        <div className="toh-difficulty">
          {[3,4,5,6].map(n=>(
            <button
              key={n}
              className={`toh-diff-btn ${numDisks===n?'toh-diff-btn--active':''}`}
              onClick={()=>reset(n)}
            >{n} disks</button>
          ))}
        </div>

        <button className="toh-btn" onClick={()=>reset()}>🔄 Reset</button>
        <p className="toh-hint">Click a peg to pick up its top disk, then click another peg to place it. Cannot place a larger disk on a smaller one.</p>
      </div>
    </>
  )
}

function SC({ label, value, color }) {
  return (
    <div className="toh-chip" style={{'--cc':color}}>
      <span className="toh-chip-label">{label}</span>
      <span className="toh-chip-val">{value}</span>
    </div>
  )
}

const TOH_STYLES=`
  @keyframes toh-orb{0%,100%{transform:translate(0,0)}40%{transform:translate(20px,-15px)}70%{transform:translate(-12px,8px)}}
  @keyframes toh-disk-in{from{transform:scale(0.6);opacity:0}to{transform:scale(1);opacity:1}}
  @keyframes toh-win{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
  @keyframes toh-sel-pulse{0%,100%{box-shadow:0 0 0 0 rgba(139,92,246,0.4)}50%{box-shadow:0 0 0 8px rgba(139,92,246,0)}}

  .toh-root{position:relative;display:flex;flex-direction:column;align-items:center;gap:14px;padding:24px 16px 32px;overflow:hidden;}
  .toh-orb{position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none;z-index:0;animation:toh-orb 9s ease-in-out infinite;}
  .toh-orb-1{width:240px;height:240px;background:rgba(139,92,246,0.12);top:-50px;left:-40px;}
  .toh-orb-2{width:200px;height:200px;background:rgba(6,182,212,0.1);bottom:-40px;right:-40px;animation-delay:-4s;}

  .toh-stats{position:relative;z-index:1;display:flex;gap:10px;}
  .toh-chip{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 14px;border-radius:14px;background:rgba(15,23,42,0.65);border:1px solid rgba(139,92,246,0.22);backdrop-filter:blur(10px);}
  .toh-chip-label{font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;}
  .toh-chip-val{font-size:18px;font-weight:800;color:var(--cc);}

  .toh-win{position:relative;z-index:1;padding:10px 22px;border-radius:16px;background:rgba(74,222,128,0.15);border:1.5px solid rgba(74,222,128,0.4);font-size:14px;font-weight:700;color:#4ade80;animation:toh-win 0.4s ease;}

  .toh-pegs{position:relative;z-index:1;display:flex;gap:10px;width:100%;max-width:440px;}
  .toh-peg-wrap{flex:1;display:flex;flex-direction:column;align-items:center;gap:0;cursor:pointer;padding:8px 0 0;border-radius:14px;border:2px solid transparent;transition:all 0.2s ease;}
  .toh-peg-wrap:hover{background:rgba(139,92,246,0.05);border-color:rgba(139,92,246,0.25);}
  .toh-peg-wrap--sel{background:rgba(139,92,246,0.12)!important;border-color:#8b5cf6!important;animation:toh-sel-pulse 1.2s ease-in-out infinite;}
  .toh-peg-wrap--last{border-color:rgba(74,222,128,0.3)!important;}
  .toh-peg-label{font-size:14px;font-weight:700;color:#64748b;margin-bottom:2px;}
  .toh-disk-area{display:flex;flex-direction:column;align-items:center;width:100%;min-height:120px;justify-content:flex-end;gap:3px;position:relative;z-index:1;}
  .toh-slot{width:100%;display:flex;justify-content:center;min-height:16px;}
  .toh-disk{height:22px;border-radius:11px;display:flex;align-items:center;justify-content:center;transition:width 0.3s ease;animation:toh-disk-in 0.25s ease;}
  .toh-disk-n{font-size:11px;font-weight:800;color:rgba(255,255,255,0.9);}
  .toh-pole{width:6px;height:16px;background:rgba(139,92,246,0.5);border-radius:3px;}
  .toh-base{width:80%;height:8px;background:rgba(139,92,246,0.4);border-radius:4px;margin-top:0;}

  .toh-difficulty{position:relative;z-index:1;display:flex;gap:8px;}
  .toh-diff-btn{padding:7px 14px;border-radius:10px;background:rgba(15,23,42,0.65);border:1.5px solid rgba(139,92,246,0.25);color:#64748b;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s ease;}
  .toh-diff-btn--active{background:rgba(139,92,246,0.25);border-color:#8b5cf6;color:#a78bfa;}
  .toh-diff-btn:hover{border-color:rgba(139,92,246,0.5);color:#94a3b8;}

  .toh-btn{position:relative;z-index:1;padding:11px 26px;border-radius:14px;background:linear-gradient(135deg,#8b5cf6,#06b6d4);border:none;color:#fff;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 6px 18px rgba(139,92,246,0.4);transition:all 0.25s ease;}
  .toh-btn:hover{transform:translateY(-3px);box-shadow:0 10px 26px rgba(139,92,246,0.55);}
  .toh-hint{position:relative;z-index:1;font-size:11px;color:#475569;text-align:center;max-width:340px;}
`
