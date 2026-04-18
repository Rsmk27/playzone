import { useState, useEffect } from 'react'

const ROWS = 6
const COLS = 7

function ConnectFour() {
  const [board, setBoard] = useState(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)))
  const [currentPlayer, setCurrentPlayer] = useState('red')
  const [winner, setWinner] = useState(null)
  const [isGameOver, setIsGameOver] = useState(false)

  const checkWin = (row, col, player, currentBoard) => {
    const directions = [
      [{ r: 0, c: 1 }, { r: 0, c: -1 }], // Horizontal
      [{ r: 1, c: 0 }, { r: -1, c: 0 }], // Vertical
      [{ r: 1, c: 1 }, { r: -1, c: -1 }], // Diagonal /
      [{ r: 1, c: -1 }, { r: -1, c: 1 }] // Diagonal \
    ]

    for (let dir of directions) {
      let count = 1
      for (let d of dir) {
        let r = row + d.r, c = col + d.c
        while (r >= 0 && r < ROWS && c >= 0 && c < COLS && currentBoard[r][c] === player) {
          count++
          r += d.r
          c += d.c
        }
      }
      if (count >= 4) return true
    }
    return false
  }

  const dropPiece = (col) => {
    if (isGameOver) return

    for (let row = ROWS - 1; row >= 0; row--) {
      if (!board[row][col]) {
        const newBoard = board.map(r => [...r])
        newBoard[row][col] = currentPlayer
        setBoard(newBoard)

        if (checkWin(row, col, currentPlayer, newBoard)) {
          setWinner(currentPlayer)
          setIsGameOver(true)
          return
        }

        // Check for draw
        if (newBoard.every(row => row.every(cell => cell !== null))) {
          setWinner('draw')
          setIsGameOver(true)
          return
        }

        setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red')
        return
      }
    }
  }

  const resetGame = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)))
    setCurrentPlayer('red')
    setWinner(null)
    setIsGameOver(false)
  }

  return (
    <div className="game-container">
      <div className="info">
        {isGameOver ? (
          winner === 'draw' ? "It's a Draw!" : `${winner.toUpperCase()} Wins!`
        ) : (
          `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn`
        )}
      </div>

      <div className="board" style={{
        display: 'inline-grid',
        gridTemplateColumns: `repeat(${COLS}, minmax(40px, 60px))`,
        gap: '8px',
        background: 'rgba(30, 27, 75, 0.8)',
        padding: '12px',
        borderRadius: '16px',
        border: '2px solid var(--card-border)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
      }}>
        {board.map((row, r) => (
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              onClick={() => dropPiece(c)}
              className="cell"
              style={{
                width: '100%',
                aspectRatio: '1/1',
                height: 'auto',
                borderRadius: '50%',
                background: cell === 'red' ? 'var(--danger)' : cell === 'yellow' ? 'var(--warning)' : 'rgba(255,255,255,0.05)',
                boxShadow: cell ? `inset 0 0 15px rgba(0,0,0,0.3), 0 0 10px ${cell === 'red' ? 'rgba(248,113,113,0.4)' : 'rgba(251,191,36,0.4)'}` : 'none',
                cursor: isGameOver ? 'default' : 'pointer'
              }}
            />
          ))
        ))}
      </div>

      <div className="game-controls">
        <button className="game-btn" onClick={resetGame}>New Game</button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .cell:hover {
          transform: scale(1.05);
          filter: brightness(1.2);
        }
      `}} />
    </div>
  )
}

export default ConnectFour
