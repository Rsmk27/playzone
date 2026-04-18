import { useState, useEffect, useCallback } from 'react'

const ROWS = 10
const COLS = 10
const MINES = 10

function Minesweeper() {
  const [grid, setGrid] = useState([])
  const [revealed, setRevealed] = useState([])
  const [flags, setFlags] = useState([])
  const [gameOver, setGameOver] = useState(false)
  const [win, setWin] = useState(false)

  const initGame = useCallback(() => {
    const newGrid = Array(ROWS).fill().map(() => Array(COLS).fill(0))
    const newRevealed = Array(ROWS).fill().map(() => Array(COLS).fill(false))
    const newFlags = Array(ROWS).fill().map(() => Array(COLS).fill(false))
    
    // Place mines
    let minesPlaced = 0
    while (minesPlaced < MINES) {
      const r = Math.floor(Math.random() * ROWS)
      const c = Math.floor(Math.random() * COLS)
      if (newGrid[r][c] !== 'M') {
        newGrid[r][c] = 'M'
        minesPlaced++
      }
    }
    
    // Calculate numbers
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (newGrid[r][c] !== 'M') {
          let count = 0
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr, nc = c + dc
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && newGrid[nr][nc] === 'M') {
                count++
              }
            }
          }
          newGrid[r][c] = count
        }
      }
    }
    
    setGrid(newGrid)
    setRevealed(newRevealed)
    setFlags(newFlags)
    setGameOver(false)
    setWin(false)
  }, [])

  useEffect(() => {
    initGame()
  }, [initGame])

  const reveal = (r, c) => {
    if (gameOver || revealed[r][c] || flags[r][c]) return

    const newRevealed = revealed.map(row => [...row])
    
    const revealRecursive = (row, col) => {
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS || newRevealed[row][col] || flags[row][col]) return
      
      newRevealed[row][col] = true
      
      if (grid[row][col] === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            revealRecursive(row + dr, col + dc)
          }
        }
      }
    }

    if (grid[r][c] === 'M') {
      setGameOver(true)
      // Reveal all mines
      const finalRevealed = newRevealed.map((row, ri) => 
        row.map((cell, ci) => grid[ri][ci] === 'M' ? true : cell)
      )
      setRevealed(finalRevealed)
      return
    }

    revealRecursive(r, c)
    setRevealed(newRevealed)

    // Check win
    let unrevealedNonMines = 0
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (grid[i][j] !== 'M' && !newRevealed[i][j]) {
          unrevealedNonMines++
        }
      }
    }

    if (unrevealedNonMines === 0) {
      setWin(true)
      setGameOver(true)
    }
  }

  const toggleFlag = (e, r, c) => {
    e.preventDefault()
    if (gameOver || revealed[r][c]) return
    const newFlags = flags.map((row, ri) => 
      row.map((cell, ci) => (ri === r && ci === c) ? !cell : cell)
    )
    setFlags(newFlags)
  }

  const flagsUsed = flags.flat().filter(Boolean).length

  return (
    <div className="game-container">
      <div className="score">Mines Left: {MINES - flagsUsed}</div>
      <div className="info">
        {gameOver ? (win ? "You Win! 🎉" : "Boom! Game Over 💥") : "Right-click to flag mines"}
      </div>

      <div className="board" style={{
        display: 'inline-grid',
        gridTemplateColumns: `repeat(${COLS}, 32px)`,
        gap: '2px',
        background: 'rgba(30, 27, 75, 0.8)',
        padding: '10px',
        borderRadius: '12px',
        border: '2px solid var(--card-border)',
        margin: '20px auto',
        touchAction: 'none'
      }}>
        {grid.map((row, r) => (
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              onClick={() => reveal(r, c)}
              onContextMenu={(e) => toggleFlag(e, r, c)}
              style={{
                width: '32px',
                height: '32px',
                background: revealed[r][c] 
                  ? (grid[r][c] === 'M' ? 'var(--danger)' : 'rgba(255,255,255,0.1)') 
                  : 'rgba(255,255,255,0.05)',
                border: revealed[r][c] ? '1px solid rgba(255,255,255,0.1)' : '2px outset rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                color: [
                  'transparent', 'var(--accent-2)', 'var(--success)', 'var(--danger)', 
                  '#818cf8', '#f472b6', '#2dd4bf', '#fbbf24', '#f87171'
                ][typeof cell === 'number' ? cell : 0]
              }}
            >
              {flags[r][c] ? '🚩' : (revealed[r][c] ? (cell === 'M' ? '💣' : (cell > 0 ? cell : '')) : '')}
            </div>
          ))
        ))}
      </div>

      <div className="game-controls">
        <button className="game-btn" onClick={initGame}>New Game</button>
      </div>
    </div>
  )
}

export default Minesweeper
