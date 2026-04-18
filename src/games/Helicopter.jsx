import { useState, useEffect, useRef } from 'react'

function Helicopter() {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [gameState, setGameState] = useState('idle') // idle, playing, gameOver
  const [info, setInfo] = useState('Press Start to play!')

  const gameRef = useRef({
    heli: { x: 100, y: 200, vy: 0 },
    obstacles: [],
    frame: 0,
    requestRef: null,
    score: 0
  })

  const startGame = () => {
    gameRef.current = {
      heli: { x: 100, y: 200, vy: 0 },
      obstacles: [],
      frame: 0,
      requestRef: null,
      score: 0
    }
    setScore(0)
    setGameState('playing')
    setInfo('Hold Space, Click or Tap to go up.')
  }

  const jump = () => {
    if (gameState === 'playing') {
      gameRef.current.heli.vy = -8
    } else if (gameState === 'idle' || gameState === 'gameOver') {
      startGame()
    }
  }

  const update = () => {
    if (gameState !== 'playing') return

    const g = gameRef.current
    const canvas = canvasRef.current
    if (!canvas) return

    g.frame++

    // Heli movement
    g.heli.vy += 0.5
    g.heli.y += g.heli.vy

    // Bounds check
    if (g.heli.y < 0 || g.heli.y > canvas.height - 30) {
      setGameState('gameOver')
      setInfo(`Game Over! Score: ${g.score}`)
      return
    }

    // Spawn obstacles
    if (g.frame % 80 === 0) {
      const gap = 150
      const h = Math.random() * (canvas.height - gap - 40) + 20
      g.obstacles.push({ x: canvas.width, top: h, gap })
    }

    // Obstacles
    for (let i = g.obstacles.length - 1; i >= 0; i--) {
      const o = g.obstacles[i]
      o.x -= 3

      if (o.x < -60) {
        g.obstacles.splice(i, 1)
        g.score++
        setScore(g.score)
        continue
      }

      // Collision
      if (g.heli.x + 15 > o.x && g.heli.x - 15 < o.x + 60) {
        if (g.heli.y - 10 < o.top || g.heli.y + 10 > o.top + o.gap) {
          setGameState('gameOver')
          setInfo(`Game Over! Score: ${g.score}`)
          return
        }
      }
    }

    draw()
    g.requestRef = requestAnimationFrame(update)
  }

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const g = gameRef.current

    ctx.fillStyle = '#87CEEB'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Heli
    ctx.fillStyle = '#333'
    // Body
    ctx.fillRect(g.heli.x - 15, g.heli.y - 10, 30, 20)
    // Tail
    ctx.fillRect(g.heli.x - 20, g.heli.y - 5, 10, 3)
    // Rotor
    ctx.fillRect(g.heli.x - 20, g.heli.y - 15, 40, 2)

    // Obstacles
    ctx.fillStyle = '#228B22'
    g.obstacles.forEach(o => {
      ctx.fillRect(o.x, 0, 60, o.top)
      ctx.fillRect(o.x, o.top + o.gap, 60, canvas.height - o.top - o.gap)
    })
  }

  useEffect(() => {
    if (gameState === 'playing') {
      gameRef.current.requestRef = requestAnimationFrame(update)
    } else {
      if (gameRef.current.requestRef) cancelAnimationFrame(gameRef.current.requestRef)
      draw()
    }
    return () => {
      if (gameRef.current.requestRef) cancelAnimationFrame(gameRef.current.requestRef)
    }
  }, [gameState])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault()
        jump()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [gameState])

  return (
    <div className="game-container">
      <div className="tally">
        <span>Score: {score}</span>
      </div>
      <div className="info">{info}</div>
      <div className="canvas-wrap">
        <canvas 
          ref={canvasRef} 
          width="600" 
          height="400"
          onMouseDown={jump}
          onTouchStart={(e) => { e.preventDefault(); jump() }}
          style={{ maxWidth: '100%', height: 'auto', background: '#87CEEB', borderRadius: '8px', border: '3px solid #ffd700' }}
        />
      </div>
      <div className="game-controls">
        <button className="game-btn" onClick={startGame}>
          {gameState === 'gameOver' ? 'Restart' : 'Start Game'}
        </button>
      </div>
    </div>
  )
}

export default Helicopter
