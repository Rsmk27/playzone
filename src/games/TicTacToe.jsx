import { useState, useEffect } from 'react'

function TicTacToe() {
  const [grid, setGrid] = useState(Array(9).fill(null))
  const [turn, setTurn] = useState('X')
  const [tally, setTally] = useState({ X: 0, O: 0, games: 0 })
  const [message, setMessage] = useState('Turn: X')
  const [isGameOver, setIsGameOver] = useState(false)

  const checkWinner = (currentGrid) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ]
    for (const [a, b, c] of lines) {
      if (currentGrid[a] && currentGrid[a] === currentGrid[b] && currentGrid[a] === currentGrid[c]) {
        return currentGrid[a]
      }
    }
    if (currentGrid.every(Boolean)) return 'Draw'
    return null
  }

  const reset = (newTally) => {
    setGrid(Array(9).fill(null))
    setTurn('X')
    setMessage('Turn: X')
    setIsGameOver(false)
    if (newTally) setTally(newTally)
  }

  const handleClick = (i) => {
    if (grid[i] || isGameOver) return

    const newGrid = [...grid]
    newGrid[i] = turn
    setGrid(newGrid)

    const winner = checkWinner(newGrid)
    if (winner) {
      setIsGameOver(true)
      const newTallyCount = { ...tally, games: tally.games + 1 }
      if (winner === 'X' || winner === 'O') {
        newTallyCount[winner]++
        setMessage(`${winner} wins!`)
      } else {
        setMessage('Draw!')
      }
      setTally(newTallyCount)
      setTimeout(() => reset(newTallyCount), 1500)
    } else {
      const nextTurn = turn === 'X' ? 'O' : 'X'
      setTurn(nextTurn)
      setMessage(`Turn: ${nextTurn}`)
    }
  }

  return (
    <div>
      <div className="tally">
        <span>X: {tally.X}</span>
        <span>O: {tally.O}</span>
        <span>Games: {tally.games}</span>
      </div>
      
      <div className="info">{message}</div>

      <div className="board grid-3">
        {grid.map((val, i) => (
          <div 
            key={i} 
            className={`cell ${val ? val.toLowerCase() : ''}`} 
            onClick={() => handleClick(i)}
          >
            {val}
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button className="btn" onClick={() => reset()}>Reset Game</button>
      </div>
    </div>
  )
}

export default TicTacToe
