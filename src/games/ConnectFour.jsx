import { useState } from 'react'

const ROWS = 6, COLS = 7
const P1 = 'red', P2 = 'yellow'
const P1_COLOR = '#f87171', P2_COLOR = '#fbbf24'
const P1_GLOW  = 'rgba(248,113,113,0.5)', P2_GLOW = 'rgba(251,191,36,0.5)'

function checkWin(board, row, col, player) {
  const dirs = [[0,1],[1,0],[1,1],[1,-1]]
  for (const [dr,dc] of dirs) {
    let count = 1
    for (const s of [1,-1]) {
      let r = row+dr*s, c = col+dc*s
      while (r>=0&&r<ROWS&&c>=0&&c<COLS&&board[r][c]===player) { count++; r+=dr*s; c+=dc*s }
    }
    if (count >= 4) return true
  }
  return false
}

export default function ConnectFour() {
  const empty = () => Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
  const [board, setBoard]         = useState(empty)
  const [turn, setTurn]           = useState(P1)
  const [winner, setWinner]       = useState(null)
  const [score, setScore]         = useState({ [P1]: 0, [P2]: 0 })
  const [hoverCol, setHoverCol]   = useState(null)
  const [lastDrop, setLastDrop]   = useState(null)

  const drop = (col) => {
    if (winner) return
    for (let row = ROWS - 1; row >= 0; row--) {
      if (!board[row][col]) {
        const nb = board.map(r => [...r])
        nb[row][col] = turn
        setBoard(nb)
        setLastDrop({ row, col })
        if (checkWin(nb, row, col, turn)) {
          setWinner(turn)
          setScore(s => ({ ...s, [turn]: s[turn] + 1 }))
        } else if (nb.every(r => r.every(c => c))) {
          setWinner('draw')
        } else {
          setTurn(t => t === P1 ? P2 : P1)
        }
        return
      }
    }
  }

  const reset = () => {
    setBoard(empty())
    setTurn(P1)
    setWinner(null)
    setLastDrop(null)
  }

  const tc = turn === P1 ? P1_COLOR : P2_COLOR
  const tg = turn === P1 ? P1_GLOW  : P2_GLOW

  return (
    <>
      <style>{CF_STYLES}</style>
      <div className="cf-root">
        <div className="cf-orb cf-orb-1" />
        <div className="cf-orb cf-orb-2" />

        {/* scoreboard */}
        <div className="cf-scoreboard">
          <div className="cf-score-slot" style={{ '--pc': P1_COLOR, '--pg': P1_GLOW }}>
            <div className="cf-score-disc" />
            <span className="cf-score-label">Red</span>
            <span className="cf-score-val">{score[P1]}</span>
          </div>
          <div className="cf-score-mid">
            {winner
              ? winner === 'draw'
                ? <span className="cf-result cf-result--draw">🤝 Draw!</span>
                : <span className="cf-result" style={{ color: winner === P1 ? P1_COLOR : P2_COLOR }}>
                    {winner === P1 ? '🔴' : '🟡'} Wins!
                  </span>
              : <div className="cf-turn-ind" style={{ '--tc': tc, '--tg': tg }}>
                  <div className="cf-turn-disc" />
                  <span style={{ color: tc }}>Your turn</span>
                </div>
            }
          </div>
          <div className="cf-score-slot" style={{ '--pc': P2_COLOR, '--pg': P2_GLOW }}>
            <div className="cf-score-disc" />
            <span className="cf-score-label">Yellow</span>
            <span className="cf-score-val">{score[P2]}</span>
          </div>
        </div>

        {/* board */}
        <div className="cf-board-wrap">
          {/* column hover preview */}
          <div className="cf-preview-row">
            {Array(COLS).fill(null).map((_, c) => (
              <div
                key={c}
                className="cf-preview-cell"
                onMouseEnter={() => setHoverCol(c)}
                onMouseLeave={() => setHoverCol(null)}
                onClick={() => drop(c)}
              >
                {hoverCol === c && !winner && (
                  <div className="cf-preview-disc" style={{ background: tc, boxShadow: `0 0 12px ${tg}` }} />
                )}
              </div>
            ))}
          </div>

          <div className="cf-board">
            {board.map((row, r) => row.map((cell, c) => {
              const isLast = lastDrop && lastDrop.row === r && lastDrop.col === c
              return (
                <div
                  key={`${r}-${c}`}
                  className="cf-cell"
                  onClick={() => drop(c)}
                  onMouseEnter={() => setHoverCol(c)}
                  onMouseLeave={() => setHoverCol(null)}
                >
                  <div
                    className={`cf-disc ${cell ? 'cf-disc--placed' : ''} ${isLast ? 'cf-disc--last' : ''}`}
                    style={cell ? {
                      background: cell === P1 ? P1_COLOR : P2_COLOR,
                      boxShadow: `0 0 16px ${cell === P1 ? P1_GLOW : P2_GLOW}, inset 0 -3px 6px rgba(0,0,0,0.25)`,
                    } : {}}
                  />
                </div>
              )
            }))}
          </div>
        </div>

        <button className="cf-btn" onClick={reset}>🔄 New Game</button>
      </div>
    </>
  )
}

const CF_STYLES = `
  @keyframes cf-orb { 0%,100%{transform:translate(0,0)} 40%{transform:translate(22px,-16px)} 70%{transform:translate(-14px,10px)} }
  @keyframes cf-drop { 0%{transform:translateY(-120px);opacity:0} 60%{transform:translateY(6px)} 80%{transform:translateY(-4px)} 100%{transform:translateY(0);opacity:1} }
  @keyframes cf-slide-up { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cf-win-pulse { 0%,100%{box-shadow:0 0 8px currentColor} 50%{box-shadow:0 0 30px currentColor,0 0 60px currentColor} }
  @keyframes cf-turn-bounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }

  .cf-root { position:relative;display:flex;flex-direction:column;align-items:center;gap:16px;padding:24px 16px 32px;overflow:hidden;min-height:520px; }
  .cf-orb { position:absolute;border-radius:50%;filter:blur(72px);pointer-events:none;z-index:0;animation:cf-orb 9s ease-in-out infinite; }
  .cf-orb-1 { width:240px;height:240px;background:rgba(248,113,113,0.1);top:-50px;left:-40px; }
  .cf-orb-2 { width:200px;height:200px;background:rgba(251,191,36,0.1);bottom:-40px;right:-40px;animation-delay:-4s; }

  .cf-scoreboard { position:relative;z-index:1;display:flex;align-items:center;gap:12px;background:rgba(15,23,42,0.65);border:1px solid rgba(139,92,246,0.22);border-radius:20px;padding:12px 20px;backdrop-filter:blur(14px);width:100%;max-width:400px;animation:cf-slide-up 0.4s ease; }
  .cf-score-slot { flex:1;display:flex;flex-direction:column;align-items:center;gap:4px; }
  .cf-score-disc { width:22px;height:22px;border-radius:50%;background:var(--pc);box-shadow:0 0 12px var(--pg); }
  .cf-score-label { font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b; }
  .cf-score-val { font-size:26px;font-weight:800;color:var(--pc); }
  .cf-score-mid { flex:1.5;display:flex;justify-content:center; }
  .cf-turn-ind { display:flex;flex-direction:column;align-items:center;gap:4px; }
  .cf-turn-disc { width:28px;height:28px;border-radius:50%;background:var(--tc);box-shadow:0 0 16px var(--tg);animation:cf-turn-bounce 1s ease-in-out infinite; }
  .cf-result { font-size:17px;font-weight:800;display:flex;align-items:center;gap:6px; }
  .cf-result--draw { color:#a78bfa; }

  .cf-board-wrap { position:relative;z-index:1;display:flex;flex-direction:column;align-items:center; }
  .cf-preview-row { display:grid;grid-template-columns:repeat(7,1fr);gap:6px;width:100%;max-width:420px;padding:0 8px 4px; }
  .cf-preview-cell { height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer; }
  .cf-preview-disc { width:20px;height:20px;border-radius:50%;transition:opacity 0.15s ease; }

  .cf-board { display:grid;grid-template-columns:repeat(7,1fr);gap:6px;background:rgba(15,23,42,0.8);border:2px solid rgba(139,92,246,0.25);border-radius:18px;padding:10px;backdrop-filter:blur(10px);width:100%;max-width:420px;box-shadow:0 16px 48px rgba(0,0,0,0.4); }
  .cf-cell { aspect-ratio:1;display:flex;align-items:center;justify-content:center;cursor:pointer; }
  .cf-disc { width:88%;height:88%;border-radius:50%;background:rgba(255,255,255,0.04);border:1.5px solid rgba(255,255,255,0.06);transition:all 0.2s ease; }
  .cf-disc--placed { }
  .cf-disc--last { animation:cf-drop 0.45s cubic-bezier(0.34,1.2,0.64,1) forwards; }

  .cf-btn { position:relative;z-index:1;padding:12px 28px;border-radius:14px;background:linear-gradient(135deg,#8b5cf6,#06b6d4);border:none;color:#fff;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 6px 18px rgba(139,92,246,0.4);transition:all 0.25s ease; }
  .cf-btn:hover { transform:translateY(-3px);box-shadow:0 10px 26px rgba(139,92,246,0.55); }
`
