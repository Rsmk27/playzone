import { useState, useEffect } from 'react'

function SlidingPuzzle() {
  const [tiles, setTiles] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0])
  const [moves, setMoves] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)

  const shuffle = () => {
    let newTiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0]
    let currentMoves = 0
    
    // Perform random valid moves to ensure solvability
    for (let i = 0; i < 200; i++) {
      const emptyIdx = newTiles.indexOf(0)
      const validMoves = [
        emptyIdx - 4, emptyIdx + 4,
        (emptyIdx % 4 !== 0 ? emptyIdx - 1 : -1),
        (emptyIdx % 4 !== 3 ? emptyIdx + 1 : -1)
      ].filter(x => x >= 0 && x < 16)
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)]
      const temp = newTiles[emptyIdx]
      newTiles[emptyIdx] = newTiles[randomMove]
      newTiles[randomMove] = temp
    }
    
    setTiles(newTiles)
    setMoves(0)
    setIsGameOver(false)
  }

  useEffect(() => {
    shuffle()
  }, [])

  const moveTile = (idx) => {
    if (isGameOver) return

    const emptyIdx = tiles.indexOf(0)
    const validMoves = [
      emptyIdx - 4, emptyIdx + 4, // up, down
      (emptyIdx % 4 !== 0 ? emptyIdx - 1 : -1), // left
      (emptyIdx % 4 !== 3 ? emptyIdx + 1 : -1)  // right
    ]
    
    if (validMoves.includes(idx)) {
      const newTiles = [...tiles]
      const temp = newTiles[idx]
      newTiles[idx] = newTiles[emptyIdx]
      newTiles[emptyIdx] = temp
      setTiles(newTiles)
      setMoves(moves + 1)
      
      if (checkWin(newTiles)) {
        setIsGameOver(true)
      }
    }
  }

  const checkWin = (currentTiles) => {
    for (let i = 0; i < 15; i++) {
      if (currentTiles[i] !== i + 1) return false
    }
    return currentTiles[15] === 0
  }

  return (
    <div className="game-container">
      <div className="score">Moves: {moves}</div>
      <div className="info">
        {isGameOver ? "You solved it!" : "Slide tiles to order them 1-15"}
      </div>

      <div className="board" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
        width: 'min(360px, 100%)',
        background: 'rgba(30, 27, 75, 0.8)',
        padding: '15px',
        borderRadius: '16px',
        margin: '20px auto'
      }}>
        {tiles.map((num, idx) => (
          <div
            key={idx}
            onClick={() => num !== 0 && moveTile(idx)}
            className={`cell ${num === 0 ? 'empty' : ''}`}
            style={{
              aspectRatio: '1/1',
              width: '100%',
              height: 'auto',
              background: num === 0 ? 'transparent' : 'var(--accent-gradient)',
              border: num === 0 ? 'none' : '2px solid var(--card-border)',
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: num === 0 || isGameOver ? 'default' : 'pointer',
              boxShadow: num === 0 ? 'none' : '0 4px 10px rgba(0,0,0,0.3)',
              transition: 'all 0.2s ease',
              borderRadius: '12px'
            }}
          >
            {num !== 0 ? num : ''}
          </div>
        ))}
      </div>

      <div className="game-controls">
        <button className="game-btn" onClick={shuffle}>New Game</button>
      </div>
    </div>
  )
}

export default SlidingPuzzle
