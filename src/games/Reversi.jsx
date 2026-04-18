import { useState } from 'react'

const P1 = 1, P2 = 2

function initBoard() {
  const b = Array(8).fill(null).map(() => Array(8).fill(0))
  b[3][3]=P2; b[3][4]=P1; b[4][3]=P1; b[4][4]=P2
  return b
}

const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]

function getFlips(board, r, c, player) {
  const opp = player === P1 ? P2 : P1
  const flips = []
  DIRS.forEach(([dr,dc]) => {
    const line = []
    let nr=r+dr, nc=c+dc
    while (nr>=0&&nr<8&&nc>=0&&nc<8&&board[nr][nc]===opp) { line.push([nr,nc]); nr+=dr; nc+=dc }
    if (line.length>0&&nr>=0&&nr<8&&nc>=0&&nc<8&&board[nr][nc]===player) flips.push(...line)
  })
  return flips
}

function getLegal(board, player) {
  const moves = []
  for(let r=0;r<8;r++) for(let c=0;c<8;c++)
    if (!board[r][c] && getFlips(board,r,c,player).length>0) moves.push([r,c])
  return moves
}

export default function Reversi() {
  const [board, setBoard]   = useState(initBoard)
  const [turn, setTurn]     = useState(P1)
  const [winner, setWinner] = useState(null)
  const [lastFlipped, setFlipped] = useState([])
  const [lastPlaced, setPlaced]   = useState(null)

  const count = (p) => board.flat().filter(x=>x===p).length

  const place = (r, c) => {
    if (winner || board[r][c]) return
    const flips = getFlips(board, r, c, turn)
    if (flips.length === 0) return
    const nb = board.map(row=>[...row])
    nb[r][c] = turn
    flips.forEach(([fr,fc]) => nb[fr][fc] = turn)
    setBoard(nb)
    setPlaced([r,c])
    setFlipped(flips.map(([fr,fc])=>`${fr}-${fc}`))
    setTimeout(() => setFlipped([]), 500)

    const nextTurn = turn === P1 ? P2 : P1
    const nextLegal = getLegal(nb, nextTurn)
    if (nextLegal.length > 0) {
      setTurn(nextTurn)
    } else {
      const curLegal = getLegal(nb, turn)
      if (curLegal.length === 0) {
        const p1 = nb.flat().filter(x=>x===P1).length
        const p2 = nb.flat().filter(x=>x===P2).length
        setWinner(p1>p2 ? P1 : p2>p1 ? P2 : 0)
      }
    }
  }

  const reset = () => {
    setBoard(initBoard())
    setTurn(P1)
    setWinner(null)
    setFlipped([])
    setPlaced(null)
  }

  const legal = getLegal(board, turn)
  const p1c = count(P1), p2c = count(P2)

  return (
    <>
      <style>{RV_STYLES}</style>
      <div className="rv-root">
        <div className="rv-orb rv-orb-1"/><div className="rv-orb rv-orb-2"/>

        <div className="rv-header">
          <SC label="◯ White" value={p1c} color="#f1f5f9"/>
          <div className="rv-turn">
            {winner !== null
              ? <span className="rv-result">{winner===0?'🤝 Draw':winner===P1?'◯ White Wins':'● Black Wins'}</span>
              : <div className="rv-turn-ind" style={{background:turn===P1?'rgba(255,255,255,0.9)':'rgba(15,23,42,0.9)',border:`2px solid ${turn===P1?'#94a3b8':'#475569'}`}}/>
            }
          </div>
          <SC label="● Black" value={p2c} color="#475569"/>
        </div>

        {/* score bar */}
        <div className="rv-score-bar-wrap">
          <div className="rv-score-bar-p1" style={{flex:p1c}}/>
          <div className="rv-score-bar-p2" style={{flex:p2c}}/>
        </div>

        <div className="rv-board">
          {board.map((row,r) => row.map((cell,c) => {
            const isLegal = !winner && legal.some(([lr,lc])=>lr===r&&lc===c)
            const isFlipping = lastFlipped.includes(`${r}-${c}`)
            const isLast = lastPlaced&&lastPlaced[0]===r&&lastPlaced[1]===c
            return (
              <div
                key={`${r}-${c}`}
                className={`rv-cell ${isLegal?'rv-cell--legal':''}`}
                onClick={() => place(r,c)}
              >
                {isLegal && !cell && <div className="rv-legal-dot" style={{background:turn===P1?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.3)'}}/>}
                {cell > 0 && (
                  <div
                    className={`rv-disc ${cell===P1?'rv-disc--p1':'rv-disc--p2'} ${isFlipping?'rv-disc--flip':''} ${isLast?'rv-disc--new':''}`}
                  />
                )}
              </div>
            )
          }))}
        </div>

        <button className="rv-btn" onClick={reset}>🔄 New Game</button>
      </div>
    </>
  )
}

function SC({label,value,color}){return<div className="rv-chip" style={{'--cc':color}}><span className="rv-chip-label">{label}</span><span className="rv-chip-val">{value}</span></div>}

const RV_STYLES=`
  @keyframes rv-orb{0%,100%{transform:translate(0,0)}40%{transform:translate(20px,-15px)}70%{transform:translate(-12px,8px)}}
  @keyframes rv-flip{0%{transform:scaleX(1)}25%{transform:scaleX(0)}50%{transform:scaleX(0)}75%{transform:scaleX(0)}100%{transform:scaleX(1)}}
  @keyframes rv-disc-in{from{transform:scale(0)}to{transform:scale(1)}}
  @keyframes rv-legal-pulse{0%,100%{opacity:0.6}50%{opacity:1}}

  .rv-root{position:relative;display:flex;flex-direction:column;align-items:center;gap:12px;padding:24px 16px 32px;overflow:hidden;}
  .rv-orb{position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none;z-index:0;animation:rv-orb 9s ease-in-out infinite;}
  .rv-orb-1{width:240px;height:240px;background:rgba(248,250,252,0.05);top:-50px;left:-40px;}
  .rv-orb-2{width:200px;height:200px;background:rgba(15,23,42,0.2);bottom:-40px;right:-40px;animation-delay:-4s;}

  .rv-header{position:relative;z-index:1;display:flex;align-items:center;gap:12px;width:100%;max-width:360px;}
  .rv-chip{flex:1;display:flex;flex-direction:column;align-items:center;padding:8px;border-radius:14px;background:rgba(15,23,42,0.65);border:1px solid rgba(139,92,246,0.22);backdrop-filter:blur(10px);}
  .rv-chip-label{font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;}
  .rv-chip-val{font-size:22px;font-weight:800;color:var(--cc);}
  .rv-turn{flex:1;display:flex;justify-content:center;}
  .rv-turn-ind{width:34px;height:34px;border-radius:50%;transition:all 0.4s ease;}
  .rv-result{font-size:12px;font-weight:700;color:#a78bfa;text-align:center;}

  .rv-score-bar-wrap{position:relative;z-index:1;display:flex;width:100%;max-width:360px;height:8px;border-radius:8px;overflow:hidden;background:rgba(255,255,255,0.05);}
  .rv-score-bar-p1{background:linear-gradient(90deg,#f1f5f9,#94a3b8);transition:flex 0.4s ease;}
  .rv-score-bar-p2{background:linear-gradient(90deg,#1e293b,#0f172a);transition:flex 0.4s ease;}

  .rv-board{position:relative;z-index:1;display:grid;grid-template-columns:repeat(8,1fr);gap:3px;padding:8px;border-radius:14px;background:#2d5016;border:2px solid rgba(74,222,128,0.3);width:100%;max-width:360px;box-shadow:0 12px 40px rgba(0,0,0,0.5);}
  .rv-cell{aspect-ratio:1;background:rgba(45,80,22,0.8);border-radius:4px;display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;transition:background 0.15s ease;}
  .rv-cell:hover{background:rgba(45,80,22,1);}
  .rv-cell--legal{background:rgba(74,222,128,0.12);}
  .rv-legal-dot{width:35%;height:35%;border-radius:50%;animation:rv-legal-pulse 1.5s ease-in-out infinite;}
  .rv-disc{width:76%;height:76%;border-radius:50%;transition:all 0.3s ease;}
  .rv-disc--p1{background:radial-gradient(circle at 35% 35%,#fff,#cbd5e1);box-shadow:0 2px 8px rgba(0,0,0,0.4);}
  .rv-disc--p2{background:radial-gradient(circle at 35% 35%,#1e293b,#020617);box-shadow:0 2px 8px rgba(0,0,0,0.6);}
  .rv-disc--flip{animation:rv-flip 0.4s ease;}
  .rv-disc--new{animation:rv-disc-in 0.3s cubic-bezier(0.34,1.3,0.64,1);}

  .rv-btn{position:relative;z-index:1;padding:12px 28px;border-radius:14px;background:linear-gradient(135deg,#8b5cf6,#06b6d4);border:none;color:#fff;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 6px 18px rgba(139,92,246,0.4);transition:all 0.25s ease;}
  .rv-btn:hover{transform:translateY(-3px);box-shadow:0 10px 26px rgba(139,92,246,0.55);}
`
