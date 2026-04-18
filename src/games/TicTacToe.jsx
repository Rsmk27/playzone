import { useState, useEffect, useRef, useCallback } from 'react'

// ── Win combinations + their SVG line coords ─────────────────────────────────
const WIN_LINES = [
  { combo: [0,1,2], x1:'16.7%', y1:'16.7%', x2:'83.3%', y2:'16.7%' },
  { combo: [3,4,5], x1:'16.7%', y1:'50%',   x2:'83.3%', y2:'50%'   },
  { combo: [6,7,8], x1:'16.7%', y1:'83.3%', x2:'83.3%', y2:'83.3%' },
  { combo: [0,3,6], x1:'16.7%', y1:'16.7%', x2:'16.7%', y2:'83.3%' },
  { combo: [1,4,7], x1:'50%',   y1:'16.7%', x2:'50%',   y2:'83.3%' },
  { combo: [2,5,8], x1:'83.3%', y1:'16.7%', x2:'83.3%', y2:'83.3%' },
  { combo: [0,4,8], x1:'16.7%', y1:'16.7%', x2:'83.3%', y2:'83.3%' },
  { combo: [2,4,6], x1:'83.3%', y1:'16.7%', x2:'16.7%', y2:'83.3%' },
]

const X_COLOR  = '#f472b6'   // pink
const O_COLOR  = '#38bdf8'   // sky
const X_GLOW   = 'rgba(244,114,182,0.55)'
const O_GLOW   = 'rgba(56,189,248,0.55)'

// ── Particle burst ────────────────────────────────────────────────────────────
function ParticleBurst({ x, y, color }) {
  const CHARS = ['✦','★','◆','●','▲','♥','✸']
  const items = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    char:  CHARS[i % CHARS.length],
    angle: (360 / 18) * i + Math.random() * 20,
    dist:  50 + Math.random() * 60,
    size:  8 + Math.random() * 8,
  }))
  return (
    <>
      {items.map(p => {
        const rad = (p.angle * Math.PI) / 180
        return (
          <span
            key={p.id}
            style={{
              position: 'fixed',
              left: x, top: y,
              fontSize: p.size,
              color,
              pointerEvents: 'none',
              zIndex: 9999,
              '--tx': `${Math.cos(rad) * p.dist}px`,
              '--ty': `${Math.sin(rad) * p.dist}px`,
              animation: 'ttt-particle 0.8s ease-out forwards',
            }}
          >{p.char}</span>
        )
      })}
    </>
  )
}

// ── X symbol drawn with SVG paths ─────────────────────────────────────────────
function XMark({ animated }) {
  return (
    <svg viewBox="0 0 60 60" width="60" height="60" className={animated ? 'ttt-mark-enter' : ''}>
      <line
        x1="12" y1="12" x2="48" y2="48"
        stroke={X_COLOR} strokeWidth="6" strokeLinecap="round"
        className="ttt-x-line1"
        style={{ filter: `drop-shadow(0 0 6px ${X_GLOW})` }}
      />
      <line
        x1="48" y1="12" x2="12" y2="48"
        stroke={X_COLOR} strokeWidth="6" strokeLinecap="round"
        className="ttt-x-line2"
        style={{ filter: `drop-shadow(0 0 6px ${X_GLOW})` }}
      />
    </svg>
  )
}

// ── O symbol drawn with SVG arc ───────────────────────────────────────────────
function OMark({ animated }) {
  return (
    <svg viewBox="0 0 60 60" width="60" height="60" className={animated ? 'ttt-mark-enter' : ''}>
      <circle
        cx="30" cy="30" r="18"
        stroke={O_COLOR} strokeWidth="6" fill="none" strokeLinecap="round"
        className="ttt-o-circle"
        style={{ filter: `drop-shadow(0 0 6px ${O_GLOW})` }}
      />
    </svg>
  )
}

// ── Single cell ────────────────────────────────────────────────────────────────
function Cell({ value, index, onClick, winHighlight, justPlaced }) {
  const isEmpty = !value
  return (
    <button
      className={[
        'ttt-cell',
        value === 'X' ? 'ttt-cell--x' : value === 'O' ? 'ttt-cell--o' : '',
        winHighlight ? 'ttt-cell--win' : '',
        isEmpty ? 'ttt-cell--empty' : '',
      ].join(' ')}
      onClick={onClick}
      disabled={!!value}
      style={winHighlight ? { '--win-color': value === 'X' ? X_GLOW : O_GLOW } : {}}
    >
      {value === 'X' && <XMark animated={justPlaced} />}
      {value === 'O' && <OMark animated={justPlaced} />}
    </button>
  )
}

// ── Winning SVG line overlay ───────────────────────────────────────────────────
function WinLine({ lineData, player }) {
  if (!lineData) return null
  const color = player === 'X' ? X_COLOR : O_COLOR
  const glow  = player === 'X' ? X_GLOW  : O_GLOW
  return (
    <svg
      className="ttt-win-svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <line
        x1={lineData.x1} y1={lineData.y1}
        x2={lineData.x2} y2={lineData.y2}
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        className="ttt-win-line"
        style={{ filter: `drop-shadow(0 0 8px ${glow})` }}
      />
    </svg>
  )
}

// ── Turn indicator pips ────────────────────────────────────────────────────────
function TurnIndicator({ turn, gameOver }) {
  if (gameOver) return null
  return (
    <div className="ttt-turn">
      <div className={`ttt-turn-pip ${turn === 'X' ? 'ttt-turn-pip--active ttt-turn-pip--x' : 'ttt-turn-pip--x ttt-turn-pip--dim'}`}>X</div>
      <div className="ttt-turn-arrow">{turn === 'X' ? '▶' : '◀'}</div>
      <div className={`ttt-turn-pip ${turn === 'O' ? 'ttt-turn-pip--active ttt-turn-pip--o' : 'ttt-turn-pip--o ttt-turn-pip--dim'}`}>O</div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function TicTacToe() {
  const [grid, setGrid]           = useState(Array(9).fill(null))
  const [turn, setTurn]           = useState('X')
  const [tally, setTally]         = useState({ X: 0, O: 0, Draw: 0, games: 0 })
  const [result, setResult]       = useState(null)   // { winner, winLine, winCombo }
  const [lastPlaced, setLast]     = useState(null)
  const [burst, setBurst]         = useState(null)
  const boardRef                  = useRef(null)

  const checkWinner = (g) => {
    for (const wl of WIN_LINES) {
      const [a, b, c] = wl.combo
      if (g[a] && g[a] === g[b] && g[a] === g[c])
        return { winner: g[a], winLine: wl, winCombo: wl.combo }
    }
    if (g.every(Boolean)) return { winner: 'Draw', winLine: null, winCombo: [] }
    return null
  }

  const triggerBurst = useCallback((player) => {
    const rect  = boardRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = rect.left + rect.width  / 2
    const y = rect.top  + rect.height / 2
    const color = player === 'X' ? X_COLOR : player === 'O' ? O_COLOR : '#a78bfa'
    const id = Date.now()
    setBurst({ id, x, y, color })
    setTimeout(() => setBurst(null), 900)
  }, [])

  const handleClick = (i) => {
    if (grid[i] || result) return
    const newGrid = [...grid]
    newGrid[i] = turn
    setGrid(newGrid)
    setLast(i)

    const res = checkWinner(newGrid)
    if (res) {
      setResult(res)
      setTally(prev => ({
        ...prev,
        [res.winner]: (prev[res.winner] ?? 0) + 1,
        games: prev.games + 1,
      }))
      setTimeout(() => triggerBurst(res.winner), 100)
      setTimeout(() => startNew(null), 2200)
    } else {
      setTurn(t => t === 'X' ? 'O' : 'X')
    }
  }

  const startNew = (resetTally) => {
    setGrid(Array(9).fill(null))
    setTurn('X')
    setResult(null)
    setLast(null)
    if (resetTally) setTally({ X: 0, O: 0, Draw: 0, games: 0 })
  }

  const resultMsg = result
    ? result.winner === 'Draw'
      ? "🤝 It's a Draw!"
      : `${result.winner === 'X' ? '🌸' : '💙'} ${result.winner} Wins!`
    : null

  const resultColor = result?.winner === 'X' ? X_COLOR : result?.winner === 'O' ? O_COLOR : '#a78bfa'
  const totalGames  = tally.games || 1

  return (
    <>
      <style>{TTT_STYLES}</style>

      {burst && <ParticleBurst key={burst.id} x={burst.x} y={burst.y} color={burst.color} />}

      <div className="ttt-root">
        {/* Animated background orbs */}
        <div className="ttt-orb ttt-orb-1" />
        <div className="ttt-orb ttt-orb-2" />

        {/* Scoreboard */}
        <div className="ttt-scoreboard">
          <ScoreCol label="X" value={tally.X} color={X_COLOR} pct={Math.round((tally.X / totalGames) * 100)} />
          <div className="ttt-sb-center">
            <div className="ttt-sb-games">{tally.games} Games</div>
            <div className="ttt-sb-draw">🤝 {tally.Draw} Draw{tally.Draw !== 1 ? 's' : ''}</div>
          </div>
          <ScoreCol label="O" value={tally.O} color={O_COLOR} pct={Math.round((tally.O / totalGames) * 100)} />
        </div>

        {/* Turn indicator */}
        <TurnIndicator turn={turn} gameOver={!!result} />

        {/* Result banner */}
        {result && (
          <div className="ttt-result-banner" style={{ '--res-color': resultColor }}>
            {resultMsg}
          </div>
        )}

        {/* Board */}
        <div className="ttt-board-wrap" ref={boardRef}>
          <div className="ttt-board">
            {grid.map((val, i) => (
              <Cell
                key={i}
                value={val}
                index={i}
                onClick={() => handleClick(i)}
                winHighlight={result?.winCombo?.includes(i)}
                justPlaced={lastPlaced === i}
              />
            ))}
          </div>
          <WinLine lineData={result?.winLine} player={result?.winner} />
        </div>

        {/* Actions */}
        <div className="ttt-actions">
          <button className="ttt-btn ttt-btn-primary" onClick={() => startNew(null)}>
            🔄 New Game
          </button>
          <button className="ttt-btn ttt-btn-ghost" onClick={() => startNew(true)}>
            Reset Score
          </button>
        </div>
      </div>
    </>
  )
}

function ScoreCol({ label, value, color, pct }) {
  return (
    <div className="ttt-score-col" style={{ '--sc': color }}>
      <span className="ttt-score-sym">{label}</span>
      <span className="ttt-score-val">{value}</span>
      <div className="ttt-score-bar">
        <div className="ttt-score-bar-fill" style={{ height: `${pct}%` }} />
      </div>
      <span className="ttt-score-pct">{pct}%</span>
    </div>
  )
}

// ── Scoped styles ─────────────────────────────────────────────────────────────
const TTT_STYLES = `
  @keyframes ttt-particle {
    0%   { transform: translate(0,0) scale(1); opacity: 1; }
    100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
  }
  @keyframes ttt-orb-drift {
    0%,100% { transform: translate(0,0); }
    40%     { transform: translate(25px,-18px); }
    70%     { transform: translate(-15px,12px); }
  }
  @keyframes ttt-cell-pop {
    0%   { transform: scale(0.4) rotate(-15deg); opacity: 0; }
    60%  { transform: scale(1.18) rotate(4deg); opacity: 1; }
    80%  { transform: scale(0.94) rotate(-2deg); }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes ttt-x-draw1 {
    from { stroke-dashoffset: 52; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes ttt-x-draw2 {
    0%   { stroke-dashoffset: 52; }
    40%  { stroke-dashoffset: 52; }
    100% { stroke-dashoffset: 0; }
  }
  @keyframes ttt-o-draw {
    from { stroke-dashoffset: 115; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes ttt-win-draw {
    from { stroke-dashoffset: 100; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes ttt-win-cell {
    0%,100% { box-shadow: 0 0 0 0 var(--win-color, rgba(74,222,128,0.4)), inset 0 0 20px rgba(0,0,0,0.2); }
    50%     { box-shadow: 0 0 22px 8px var(--win-color, rgba(74,222,128,0.4)), inset 0 0 20px rgba(0,0,0,0.2); }
  }
  @keyframes ttt-result-slide {
    from { opacity: 0; transform: translateY(-12px) scale(0.9); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes ttt-turn-pulse {
    0%,100% { transform: scale(1); opacity: 1; }
    50%     { transform: scale(1.12); opacity: 0.85; }
  }
  @keyframes ttt-slide-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .ttt-root {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 24px 16px 32px;
    overflow: hidden;
    min-height: 560px;
  }

  /* orbs */
  .ttt-orb {
    position: absolute; border-radius: 50%;
    filter: blur(72px); pointer-events: none; z-index: 0;
    animation: ttt-orb-drift 9s ease-in-out infinite;
  }
  .ttt-orb-1 { width:260px; height:260px; background:rgba(244,114,182,0.14); top:-60px; left:-60px; animation-delay:0s; }
  .ttt-orb-2 { width:220px; height:220px; background:rgba(56,189,248,0.14); bottom:-50px; right:-50px; animation-delay:-4s; }

  /* scoreboard */
  .ttt-scoreboard {
    position: relative; z-index: 1;
    display: flex; align-items: stretch; gap: 16px;
    background: rgba(15,23,42,0.6);
    border: 1px solid rgba(139,92,246,0.22);
    border-radius: 20px;
    padding: 14px 24px;
    backdrop-filter: blur(14px);
    width: 100%; max-width: 380px;
    animation: ttt-slide-up 0.4s ease;
  }
  .ttt-score-col {
    flex: 1;
    display: flex; flex-direction: column; align-items: center; gap: 4px;
  }
  .ttt-score-sym { font-size: 20px; font-weight: 900; color: var(--sc); letter-spacing: 1px; }
  .ttt-score-val { font-size: 32px; font-weight: 800; color: var(--sc); line-height: 1; }
  .ttt-score-bar {
    width: 8px; height: 48px;
    background: rgba(139,92,246,0.12);
    border-radius: 99px; overflow: hidden;
    display: flex; flex-direction: column; justify-content: flex-end;
  }
  .ttt-score-bar-fill {
    width: 100%;
    background: var(--sc);
    border-radius: 99px;
    transition: height 0.6s cubic-bezier(0.4,0,0.2,1);
    min-height: 4px;
    box-shadow: 0 0 8px var(--sc);
  }
  .ttt-score-pct { font-size: 10px; color: #64748b; }
  .ttt-sb-center { flex: 1.2; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; }
  .ttt-sb-games { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
  .ttt-sb-draw  { font-size: 13px; color: #94a3b8; font-weight: 600; }

  /* turn indicator */
  .ttt-turn {
    position: relative; z-index: 1;
    display: flex; align-items: center; gap: 12px;
    animation: ttt-slide-up 0.35s ease;
  }
  .ttt-turn-pip {
    width: 44px; height: 44px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; font-weight: 900;
    transition: all 0.3s ease;
  }
  .ttt-turn-pip--x { color: ${X_COLOR}; border: 2px solid ${X_COLOR}; }
  .ttt-turn-pip--o { color: ${O_COLOR}; border: 2px solid ${O_COLOR}; }
  .ttt-turn-pip--active {
    animation: ttt-turn-pulse 1.2s ease-in-out infinite;
    box-shadow: 0 0 16px currentColor;
  }
  .ttt-turn-pip--dim { opacity: 0.28; }
  .ttt-turn-arrow { font-size: 14px; color: #475569; }

  /* result banner */
  .ttt-result-banner {
    position: relative; z-index: 1;
    padding: 10px 28px;
    border-radius: 99px;
    border: 2px solid var(--res-color);
    background: rgba(15,23,42,0.7);
    color: var(--res-color);
    font-size: 20px; font-weight: 800; letter-spacing: 0.5px;
    box-shadow: 0 0 24px var(--res-color), inset 0 0 20px rgba(0,0,0,0.3);
    animation: ttt-result-slide 0.4s cubic-bezier(0.34,1.56,0.64,1);
    backdrop-filter: blur(8px);
  }

  /* board */
  .ttt-board-wrap {
    position: relative; z-index: 1;
    width: 300px; height: 300px;
  }
  .ttt-board {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    width: 100%; height: 100%;
  }
  .ttt-cell {
    border-radius: 16px;
    background: rgba(15,23,42,0.65);
    border: 2px solid rgba(139,92,246,0.2);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
    position: relative; overflow: hidden;
    backdrop-filter: blur(8px);
  }
  .ttt-cell--empty:hover {
    background: rgba(139,92,246,0.12);
    border-color: rgba(139,92,246,0.45);
    transform: scale(1.04);
    box-shadow: 0 0 16px rgba(139,92,246,0.25);
  }
  .ttt-cell--x { border-color: rgba(244,114,182,0.45); background: rgba(244,114,182,0.08); }
  .ttt-cell--o { border-color: rgba(56,189,248,0.45);  background: rgba(56,189,248,0.08);  }
  .ttt-cell--win {
    animation: ttt-win-cell 1s ease-in-out 3;
    background: rgba(167,139,250,0.12) !important;
  }
  .ttt-cell:disabled { cursor: not-allowed; }

  /* SVG mark animations */
  .ttt-mark-enter { animation: ttt-cell-pop 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards; }

  .ttt-x-line1 {
    stroke-dasharray: 52; stroke-dashoffset: 52;
    animation: ttt-x-draw1 0.25s ease forwards;
  }
  .ttt-x-line2 {
    stroke-dasharray: 52; stroke-dashoffset: 52;
    animation: ttt-x-draw2 0.45s ease forwards;
  }
  .ttt-o-circle {
    stroke-dasharray: 115; stroke-dashoffset: 115;
    animation: ttt-o-draw 0.4s ease forwards;
  }

  /* winning SVG line */
  .ttt-win-svg {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    pointer-events: none; z-index: 10;
  }
  .ttt-win-line {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: ttt-win-draw 0.5s ease 0.1s forwards;
    stroke-width: 2.5;
  }

  /* actions */
  .ttt-actions {
    position: relative; z-index: 1;
    display: flex; gap: 12px;
    animation: ttt-slide-up 0.4s ease;
  }
  .ttt-btn {
    padding: 11px 24px;
    border-radius: 14px;
    font-size: 14px; font-weight: 700;
    cursor: pointer; border: none;
    transition: all 0.25s ease;
  }
  .ttt-btn-primary {
    background: linear-gradient(135deg, #8b5cf6, #06b6d4);
    color: #fff;
    box-shadow: 0 6px 18px rgba(139,92,246,0.4);
  }
  .ttt-btn-primary:hover { transform: translateY(-3px); box-shadow: 0 10px 26px rgba(139,92,246,0.55); }
  .ttt-btn-ghost {
    background: rgba(30,27,75,0.6);
    border: 1.5px solid rgba(139,92,246,0.3);
    color: #94a3b8;
  }
  .ttt-btn-ghost:hover { background: rgba(139,92,246,0.15); color: #f1f5f9; transform: translateY(-2px); }
`
