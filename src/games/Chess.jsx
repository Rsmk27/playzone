import { useState } from 'react'

const PIECES = {
  K:'♔',Q:'♕',R:'♖',B:'♗',N:'♘',P:'♙',
  k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟',
}

function initBoard() {
  return [
    ['r','n','b','q','k','b','n','r'],
    ['p','p','p','p','p','p','p','p'],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    ['P','P','P','P','P','P','P','P'],
    ['R','N','B','Q','K','B','N','R'],
  ]
}

const isWhite = (p) => p && p === p.toUpperCase()
const isBlack = (p) => p && p === p.toLowerCase()

function getLegalMoves(board, r, c) {
  const piece = board[r][c]
  if (!piece) return []
  const moves = []
  const add = (tr, tc) => {
    if (tr<0||tr>7||tc<0||tc>7) return false
    const target = board[tr][tc]
    if (isWhite(piece) && isWhite(target)) return false
    if (isBlack(piece) && isBlack(target)) return false
    moves.push([tr, tc])
    return !target
  }

  const slide = (dr, dc) => { let r2=r+dr,c2=c+dc; while(add(r2,c2)&&!board[r2][c2]){r2+=dr;c2+=dc} }

  const pt = piece.toLowerCase()
  if (pt === 'p') {
    const dir = isWhite(piece) ? -1 : 1
    const start = isWhite(piece) ? 6 : 1
    if (!board[r+dir]?.[c]) { moves.push([r+dir,c]); if(r===start&&!board[r+2*dir]?.[c]) moves.push([r+2*dir,c]) }
    [-1,1].forEach(dc => {
      const tr=r+dir,tc=c+dc
      if(tr>=0&&tr<=7&&tc>=0&&tc<=7) {
        const t=board[tr][tc]
        if((isWhite(piece)&&isBlack(t))||(isBlack(piece)&&isWhite(t))) moves.push([tr,tc])
      }
    })
  }
  if (pt==='r') { [[0,1],[0,-1],[1,0],[-1,0]].forEach(([dr,dc])=>slide(dr,dc)) }
  if (pt==='b') { [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc])=>slide(dr,dc)) }
  if (pt==='q') { [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc])=>slide(dr,dc)) }
  if (pt==='k') { [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc])=>add(r+dr,c+dc)) }
  if (pt==='n') { [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]].forEach(([dr,dc])=>add(r+dr,c+dc)) }
  return moves
}

export default function Chess() {
  const [board, setBoard]   = useState(initBoard)
  const [turn, setTurn]     = useState('white')
  const [sel, setSel]       = useState(null)
  const [legalMoves, setLM] = useState([])
  const [captures, setCaptures] = useState({ white: [], black: [] })
  const [lastMove, setLast] = useState(null)
  const [status, setStatus] = useState(null)

  const click = (r, c) => {
    if (status) return
    const piece = board[r][c]
    const isMyPiece = (turn === 'white' && isWhite(piece)) || (turn === 'black' && isBlack(piece))

    if (sel) {
      const isMove = legalMoves.some(([mr,mc])=>mr===r&&mc===c)
      if (isMove) {
        const nb = board.map(row=>[...row])
        const [sr,sc] = sel
        const captured = nb[r][c]
        nb[r][c] = nb[sr][sc]
        nb[sr][sc] = null
        // Pawn promotion
        if (nb[r][c]==='P'&&r===0) nb[r][c]='Q'
        if (nb[r][c]==='p'&&r===7) nb[r][c]='q'
        setBoard(nb)
        setLast([[sr,sc],[r,c]])
        if (captured) {
          setCaptures(prev => {
            const side = isWhite(captured) ? 'black' : 'white'
            return {...prev,[side]:[...prev[side],captured]}
          })
          if (captured==='k') setStatus('White wins! ♔')
          if (captured==='K') setStatus('Black wins! ♚')
        }
        setSel(null); setLM([])
        setTurn(t => t==='white'?'black':'white')
        return
      }
    }
    if (isMyPiece) {
      setSel([r,c])
      setLM(getLegalMoves(board,r,c))
    } else {
      setSel(null); setLM([])
    }
  }

  const reset = () => {
    setBoard(initBoard())
    setTurn('white')
    setSel(null); setLM([])
    setCaptures({white:[],black:[]})
    setLast(null); setStatus(null)
  }

  const isHighlighted = (r,c) => lastMove && (
    (lastMove[0][0]===r&&lastMove[0][1]===c) || (lastMove[1][0]===r&&lastMove[1][1]===c)
  )

  return (
    <>
      <style>{CH_STYLES}</style>
      <div className="ch-root">
        <div className="ch-orb ch-orb-1"/><div className="ch-orb ch-orb-2"/>

        <div className="ch-header">
          <div className="ch-captures ch-captures--black">{captures.black.map((p,i)=><span key={i} style={{fontSize:'12px'}}>{PIECES[p]}</span>)}</div>
          <div className="ch-status-pill">
            {status
              ? <span className="ch-status-res">{status}</span>
              : <span className="ch-turn">{turn === 'white' ? '♔ White' : '♚ Black'}</span>
            }
          </div>
          <div className="ch-captures ch-captures--white">{captures.white.map((p,i)=><span key={i} style={{fontSize:'12px'}}>{PIECES[p]}</span>)}</div>
        </div>

        <div className="ch-board">
          {board.map((row,r) => row.map((piece,c) => {
            const isLight = (r+c)%2===0
            const isSel   = sel && sel[0]===r&&sel[1]===c
            const isLegal = legalMoves.some(([lr,lc])=>lr===r&&lc===c)
            const isLast  = isHighlighted(r,c)
            return (
              <div
                key={`${r}-${c}`}
                className={`ch-cell ${isLight?'ch-cell--light':'ch-cell--dark'} ${isSel?'ch-cell--sel':''} ${isLast?'ch-cell--last':''} ${isLegal&&piece?'ch-cell--capture':''}`}
                onClick={() => click(r,c)}
              >
                {isLegal && !piece && <div className="ch-dot"/>}
                {isLegal &&  piece && <div className="ch-capture-ring"/>}
                {piece && (
                  <span className={`ch-piece ${isWhite(piece)?'ch-piece--white':'ch-piece--black'} ${isSel?'ch-piece--sel':''}`}>
                    {PIECES[piece]}
                  </span>
                )}
              </div>
            )
          }))}
        </div>

        <button className="ch-btn" onClick={reset}>🔄 New Game</button>
        <p className="ch-hint">Click a piece to select, then click a highlighted square to move</p>
      </div>
    </>
  )
}

const CH_STYLES=`
  @keyframes ch-orb{0%,100%{transform:translate(0,0)}40%{transform:translate(20px,-15px)}70%{transform:translate(-12px,8px)}}
  @keyframes ch-piece-sel{0%,100%{transform:scale(1) translateY(0)}50%{transform:scale(1.1) translateY(-2px)}}
  @keyframes ch-capture-ring{0%,100%{transform:scale(0.7)}50%{transform:scale(0.85)}}

  .ch-root{position:relative;display:flex;flex-direction:column;align-items:center;gap:10px;padding:24px 16px 32px;overflow:hidden;}
  .ch-orb{position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none;z-index:0;animation:ch-orb 9s ease-in-out infinite;}
  .ch-orb-1{width:240px;height:240px;background:rgba(251,191,36,0.1);top:-50px;left:-40px;}
  .ch-orb-2{width:200px;height:200px;background:rgba(139,92,246,0.1);bottom:-40px;right:-40px;animation-delay:-4s;}

  .ch-header{position:relative;z-index:1;display:flex;align-items:center;gap:8px;width:100%;max-width:360px;}
  .ch-captures{display:flex;flex-wrap:wrap;gap:2px;flex:1;min-height:20px;}
  .ch-status-pill{padding:8px 16px;border-radius:20px;background:rgba(15,23,42,0.7);border:1.5px solid rgba(251,191,36,0.3);backdrop-filter:blur(10px);flex-shrink:0;}
  .ch-turn{font-size:14px;font-weight:700;color:#fbbf24;}
  .ch-status-res{font-size:13px;font-weight:700;color:#4ade80;}

  .ch-board{position:relative;z-index:1;display:grid;grid-template-columns:repeat(8,1fr);border-radius:10px;overflow:hidden;border:2px solid rgba(251,191,36,0.3);box-shadow:0 12px 40px rgba(0,0,0,0.5);width:100%;max-width:360px;}
  .ch-cell{aspect-ratio:1;display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;transition:background 0.15s ease;}
  .ch-cell--light{background:#f0d9b5;}
  .ch-cell--dark{background:#b58863;}
  .ch-cell--sel{background:#f6f669!important;}
  .ch-cell--last{background:rgba(205,210,106,0.7)!important;}
  .ch-dot{width:28%;height:28%;border-radius:50%;background:rgba(0,0,0,0.28);pointer-events:none;}
  .ch-capture-ring{position:absolute;inset:3px;border-radius:50%;border:3px solid rgba(0,0,0,0.28);animation:ch-capture-ring 1s ease-in-out infinite;pointer-events:none;}
  .ch-piece{font-size:clamp(18px,4vw,28px);line-height:1;user-select:none;transition:transform 0.15s ease;}
  .ch-piece--white{color:#fff;text-shadow:0 1px 3px rgba(0,0,0,0.8),0 0 2px rgba(0,0,0,0.5);}
  .ch-piece--black{color:#1a1a1a;text-shadow:0 1px 2px rgba(255,255,255,0.2);}
  .ch-piece--sel{animation:ch-piece-sel 1s ease-in-out infinite;}

  .ch-btn{position:relative;z-index:1;padding:12px 28px;border-radius:14px;background:linear-gradient(135deg,#8b5cf6,#06b6d4);border:none;color:#fff;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 6px 18px rgba(139,92,246,0.4);transition:all 0.25s ease;}
  .ch-btn:hover{transform:translateY(-3px);box-shadow:0 10px 26px rgba(139,92,246,0.55);}
  .ch-hint{position:relative;z-index:1;font-size:10px;color:#475569;text-align:center;max-width:320px;}
`
