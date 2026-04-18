import { useState } from 'react'

const P1 = 1, P2 = 2, P1K = 3, P2K = 4

function initBoard() {
  const b = Array(8).fill(null).map(() => Array(8).fill(0))
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 8; c++)
      if ((r + c) % 2 === 1) b[r][c] = P2
  for (let r = 5; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if ((r + c) % 2 === 1) b[r][c] = P1
  return b
}

function getJumps(board, r, c) {
  const piece = board[r][c]
  const dirs  = piece === P1 || piece >= P1K
    ? [[-1,-1],[-1,1],...(piece >= P1K ? [[1,-1],[1,1]] : [])]
    : [[1,-1],[1,1],...(piece >= P1K ? [[-1,-1],[-1,1]] : [])]
  const jumps = []
  dirs.forEach(([dr,dc]) => {
    const mr = r+dr, mc = c+dc, lr = r+2*dr, lc = c+2*dc
    if (lr>=0&&lr<8&&lc>=0&&lc<8&&board[mr]?.[mc]&&[P2,P2K].includes(board[mr][mc])!==([P1,P1K].includes(piece)) && board[lr][lc]===0)
      jumps.push([lr,lc])
  })
  return jumps
}

function getMoves(board, r, c) {
  const piece = board[r][c]
  const dirs  = piece === P1 || piece >= P1K
    ? [[-1,-1],[-1,1],...(piece >= P1K ? [[1,-1],[1,1]] : [])]
    : [[1,-1],[1,1],...(piece >= P1K ? [[-1,-1],[-1,1]] : [])]
  return dirs.map(([dr,dc]) => [r+dr,c+dc]).filter(([nr,nc]) => nr>=0&&nr<8&&nc>=0&&nc<8&&board[nr][nc]===0)
}

export default function Checkers() {
  const [board, setBoard]   = useState(initBoard)
  const [turn, setTurn]     = useState(P1)
  const [sel, setSel]       = useState(null)
  const [legalMoves, setLM] = useState([])
  const [score, setScore]   = useState({ [P1]: 0, [P2]: 0 })
  const [winner, setWinner] = useState(null)
  const [lastMoved, setLast]= useState(null)

  const playerPieces = (p) => (p === P1 ? [P1, P1K] : [P2, P2K])

  const click = (r, c) => {
    if (winner) return
    const cell = board[r][c]
    if (playerPieces(turn).includes(cell)) {
      const jumps  = getJumps(board, r, c)
      const moves  = jumps.length > 0 ? jumps : getMoves(board, r, c)
      setSel([r,c])
      setLM(moves)
      return
    }
    if (!sel) return
    const isMove = legalMoves.some(([mr,mc]) => mr===r&&mc===c)
    if (!isMove) { setSel(null); setLM([]); return }
    const nb = board.map(row=>[...row])
    const [sr,sc] = sel
    const piece = nb[sr][sc]
    nb[r][c] = piece
    nb[sr][sc] = 0
    if (Math.abs(r-sr) === 2) {
      const mr = (sr+r)/2, mc = (sc+c)/2
      nb[mr][mc] = 0
    }
    if (r === 0 && piece === P1)  nb[r][c] = P1K
    if (r === 7 && piece === P2)  nb[r][c] = P2K
    setBoard(nb)
    setLast([r,c])
    setSel(null); setLM([])
    const nextTurn = turn === P1 ? P2 : P1
    const opp = playerPieces(nextTurn)
    const hasPieces = nb.flat().some(c => opp.includes(c))
    if (!hasPieces) {
      setWinner(turn)
      setScore(s => ({...s, [turn]: s[turn]+1}))
    } else {
      setTurn(nextTurn)
    }
  }

  const reset = () => {
    setBoard(initBoard())
    setTurn(P1)
    setSel(null)
    setLM([])
    setWinner(null)
    setLast(null)
  }

  return (
    <>
      <style>{CHK_STYLES}</style>
      <div className="chk-root">
        <div className="chk-orb chk-orb-1"/><div className="chk-orb chk-orb-2"/>

        <div className="chk-header">
          <SC label="Red" value={score[P1]} color="#f87171"/>
          <div className="chk-turn">
            {winner
              ? <span className="chk-result" style={{color:winner===P1?'#f87171':'#94a3b8'}}>{winner===P1?'🔴 Red Wins':'⚫ Black Wins'} 🏆</span>
              : <span className="chk-result">{turn===P1?'🔴':'⚫'} Turn</span>
            }
          </div>
          <SC label="Blk" value={score[P2]} color="#94a3b8"/>
        </div>

        <div className="chk-board">
          {board.map((row,r) => row.map((cell,c) => {
            const dark = (r+c)%2===1
            const isSel  = sel && sel[0]===r&&sel[1]===c
            const isLegal= legalMoves.some(([mr,mc])=>mr===r&&mc===c)
            const isLast = lastMoved&&lastMoved[0]===r&&lastMoved[1]===c
            return (
              <div
                key={`${r}-${c}`}
                className={`chk-cell ${dark?'chk-cell--dark':'chk-cell--light'} ${isSel?'chk-cell--sel':''} ${isLegal?'chk-cell--legal':''} ${isLast?'chk-cell--last':''}`}
                onClick={() => click(r,c)}
              >
                {isLegal && !cell && <div className="chk-move-dot"/>}
                {cell > 0 && (
                  <div
                    className={`chk-piece ${[P1,P1K].includes(cell)?'chk-piece--p1':'chk-piece--p2'} ${isSel?'chk-piece--selected':''}`}
                  >
                    {cell===P1K || cell===P2K ? '♛' : ''}
                  </div>
                )}
              </div>
            )
          }))}
        </div>

        <button className="chk-btn" onClick={reset}>🔄 New Game</button>
      </div>
    </>
  )
}

function SC({label,value,color}){return<div className="chk-chip" style={{'--cc':color}}><span className="chk-chip-label">{label}</span><span className="chk-chip-val">{value}</span></div>}

const CHK_STYLES=`
  @keyframes chk-orb{0%,100%{transform:translate(0,0)}40%{transform:translate(20px,-15px)}70%{transform:translate(-12px,8px)}}
  @keyframes chk-piece-in{from{transform:scale(0.5);opacity:0}to{transform:scale(1);opacity:1}}
  @keyframes chk-sel{0%,100%{box-shadow:0 0 0 3px currentColor}50%{box-shadow:0 0 0 6px currentColor}}

  .chk-root{position:relative;display:flex;flex-direction:column;align-items:center;gap:12px;padding:24px 16px 32px;overflow:hidden;}
  .chk-orb{position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none;z-index:0;animation:chk-orb 9s ease-in-out infinite;}
  .chk-orb-1{width:240px;height:240px;background:rgba(248,113,113,0.1);top:-50px;left:-40px;}
  .chk-orb-2{width:200px;height:200px;background:rgba(139,92,246,0.1);bottom:-40px;right:-40px;animation-delay:-4s;}

  .chk-header{position:relative;z-index:1;display:flex;align-items:center;gap:12px;width:100%;max-width:360px;}
  .chk-chip{flex:1;display:flex;flex-direction:column;align-items:center;padding:8px;border-radius:14px;background:rgba(15,23,42,0.65);border:1px solid rgba(139,92,246,0.22);backdrop-filter:blur(10px);}
  .chk-chip-label{font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;}
  .chk-chip-val{font-size:20px;font-weight:800;color:var(--cc);}
  .chk-turn{flex:1.5;text-align:center;}
  .chk-result{font-size:14px;font-weight:700;color:#94a3b8;}

  .chk-board{position:relative;z-index:1;display:grid;grid-template-columns:repeat(8,1fr);border-radius:12px;overflow:hidden;border:2px solid rgba(139,92,246,0.3);box-shadow:0 12px 40px rgba(0,0,0,0.5);width:100%;max-width:360px;}
  .chk-cell{aspect-ratio:1;display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;transition:all 0.15s ease;}
  .chk-cell--light{background:#d9b896;}
  .chk-cell--dark{background:#8b4513;}
  .chk-cell--sel{background:#fbbf24!important;}
  .chk-cell--legal{background:#3b1f0a!important;}
  .chk-cell--last{background:rgba(74,222,128,0.2)!important;}
  .chk-move-dot{width:30%;height:30%;border-radius:50%;background:rgba(74,222,128,0.7);}
  .chk-piece{width:73%;height:73%;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;transition:all 0.2s ease;animation:chk-piece-in 0.25s ease;}
  .chk-piece--p1{background:radial-gradient(circle at 35% 35%,#fca5a5,#dc2626);box-shadow:0 3px 8px rgba(0,0,0,0.5),inset 0 1px 3px rgba(255,255,255,0.3);}
  .chk-piece--p2{background:radial-gradient(circle at 35% 35%,#6b7280,#111827);box-shadow:0 3px 8px rgba(0,0,0,0.5),inset 0 1px 3px rgba(255,255,255,0.15);}
  .chk-piece--selected{animation:chk-sel 1s ease-in-out infinite;transform:scale(1.12);}

  .chk-btn{position:relative;z-index:1;padding:12px 28px;border-radius:14px;background:linear-gradient(135deg,#8b5cf6,#06b6d4);border:none;color:#fff;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 6px 18px rgba(139,92,246,0.4);transition:all 0.25s ease;}
  .chk-btn:hover{transform:translateY(-3px);box-shadow:0 10px 26px rgba(139,92,246,0.55);}
`
