import { useState, useEffect } from 'react'

function WhackAMole() {
  const [score, setScore] = useState(0)
  const [active, setActive] = useState(-1)
  const [message, setMessage] = useState('Click the mole when it appears!')

  useEffect(() => {
    const interval = setInterval(() => {
      setActive(Math.floor(Math.random() * 16))
    }, 800)
    return () => clearInterval(interval)
  }, [])

  const handleClick = (i) => {
    if (i === active) {
      setScore(s => s + 1)
      setActive(-1)
      // Visual feedback or sound could go here
    }
  }

  return (
    <div className="game-container">
      <div className="info">{message}</div>
      <div className="score">Score: {score}</div>
      
      <div className="board" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 80px)', 
        gap: '12px',
        justifyContent: 'center',
        margin: '20px auto',
        padding: '20px'
      }}>
        {Array(16).fill(null).map((_, i) => (
          <div 
            key={i}
            className="cell"
            style={{ 
              width: '80px',
              height: '80px',
              fontSize: '32px',
              background: i === active ? 'rgba(139, 92, 246, 0.2)' : 'rgba(30, 27, 75, 0.4)'
            }}
            onClick={() => handleClick(i)}
          >
            {i === active ? '🐹' : '🕳️'}
          </div>
        ))}
      </div>

      <div className="controls">
        <button className="btn" onClick={() => setScore(0)}>Reset Score</button>
      </div>
    </div>
  )
}

export default WhackAMole
