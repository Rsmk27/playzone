import { useState, useEffect, useCallback } from 'react'

const COLORS = ['red', 'green', 'blue', 'yellow']
const COLOR_CLASSES = {
  red: 'var(--danger)',
  green: 'var(--success)',
  blue: 'var(--accent-2)',
  yellow: 'var(--warning)'
}

function SimonSays() {
  const [sequence, setSequence] = useState([])
  const [playerSequence, setPlayerSequence] = useState([])
  const [level, setLevel] = useState(0)
  const [activeColor, setActiveColor] = useState(null)
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [isComputerTurn, setIsComputerTurn] = useState(false)
  const [message, setMessage] = useState('Press Start to Play')

  const playSequence = useCallback(async (currentSequence) => {
    setIsComputerTurn(true)
    setMessage('Watch carefully...')
    for (let i = 0; i < currentSequence.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600))
      setActiveColor(COLORS[currentSequence[i]])
      await new Promise(resolve => setTimeout(resolve, 600))
      setActiveColor(null)
    }
    setIsComputerTurn(false)
    setMessage('Your turn!')
  }, [])

  const nextLevel = useCallback(() => {
    const nextColorIndex = Math.floor(Math.random() * 4)
    const newSequence = [...sequence, nextColorIndex]
    setSequence(newSequence)
    setPlayerSequence([])
    setLevel(prev => prev + 1)
    playSequence(newSequence)
  }, [sequence, playSequence])

  const startGame = () => {
    setSequence([])
    setPlayerSequence([])
    setLevel(0)
    setIsGameStarted(true)
    setMessage('Starting...')
    
    // We need to trigger nextLevel but with an empty sequence
    const nextColorIndex = Math.floor(Math.random() * 4)
    const newSequence = [nextColorIndex]
    setSequence(newSequence)
    setLevel(1)
    playSequence(newSequence)
  }

  const handleColorClick = (index) => {
    if (isComputerTurn || !isGameStarted) return

    setActiveColor(COLORS[index])
    setTimeout(() => setActiveColor(null), 300)

    const newPlayerSequence = [...playerSequence, index]
    setPlayerSequence(newPlayerSequence)

    const currentIndex = newPlayerSequence.length - 1
    if (newPlayerSequence[currentIndex] !== sequence[currentIndex]) {
      setMessage(`Game Over! Final Level: ${level}`)
      setIsGameStarted(false)
      return
    }

    if (newPlayerSequence.length === sequence.length) {
      setMessage('Good job!')
      setTimeout(nextLevel, 1000)
    }
  }

  return (
    <div className="game-container">
      <div className="score">Level: {level}</div>
      <div className="info">{message}</div>

      <div className="board" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
        width: 'min(300px, 100%)',
        margin: '20px auto'
      }}>
        {COLORS.map((color, index) => (
          <div
            key={color}
            onClick={() => handleColorClick(index)}
            className="cell"
            style={{
              aspectRatio: '1/1',
              width: '100%',
              height: 'auto',
              background: COLOR_CLASSES[color],
              opacity: activeColor === color ? 1 : 0.6,
              transform: activeColor === color ? 'scale(0.95)' : 'none',
              filter: activeColor === color ? 'brightness(1.5) blur(2px)' : 'none',
              boxShadow: activeColor === color ? `0 0 30px ${COLOR_CLASSES[color]}` : 'none',
              transition: 'all 0.2s ease'
            }}
          />
        ))}
      </div>

      <div className="game-controls">
        <button className="game-btn" onClick={startGame}>
          {isGameStarted ? 'Restart' : 'Start Game'}
        </button>
      </div>
    </div>
  )
}

export default SimonSays
