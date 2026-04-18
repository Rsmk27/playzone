import { useState, useEffect, useRef } from 'react'

function CarRacing() {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [gameState, setGameState] = useState('idle') // idle, playing, gameOver
  const [info, setInfo] = useState('Press Start to play!')

  const gameRef = useRef({
    player: { x: 180, y: 480, w: 40, h: 60 },
    cars: [],
    keys: {},
    roadOffset: 0,
    requestRef: null,
    score: 0
  })

  const startGame = () => {
    gameRef.current = {
      player: { x: 180, y: 480, w: 40, h: 60 },
      cars: [],
      keys: {},
      roadOffset: 0,
      requestRef: null,
      score: 0
    }
    setScore(0)
    setGameState('playing')
    setInfo('Use ← → arrows to steer.')
  }

  const update = () => {
    if (gameState !== 'playing') return

    const g = gameRef.current
    const canvas = canvasRef.current
    if (!canvas) return

    g.roadOffset = (g.roadOffset + 5) % 40

    // Player movement
    if (g.keys['ArrowLeft'] && g.player.x > 100) g.player.x -= 5
    if (g.keys['ArrowRight'] && g.player.x < 260) g.player.x += 5

    // Spawn cars
    if (Math.random() < 0.02) {
      const lane = Math.random() < 0.5 ? 130 : 230
      g.cars.push({ x: lane, y: -60, w: 40, h: 60 })
    }

    // Cars
    for (let i = g.cars.length - 1; i >= 0; i--) {
      const car = g.cars[i]
      car.y += 5

      if (car.y > canvas.height) {
        g.cars.splice(i, 1)
        g.score++
        setScore(g.score)
        continue
      }

      // Collision
      if (
        g.player.x < car.x + car.w &&
        g.player.x + g.player.w > car.x &&
        g.player.y < car.y + car.h &&
        g.player.y + g.player.h > car.y
      ) {
        setGameState('gameOver')
        setInfo(`Crash! Final Score: ${g.score}`)
        return
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

    // Grass
    ctx.fillStyle = '#228B22'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Road
    ctx.fillStyle = '#333'
    ctx.fillRect(100, 0, 200, canvas.height)

    // Road lines
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 3
    ctx.setLineDash([20, 20])
    ctx.lineDashOffset = -g.roadOffset
    ctx.beginPath()
    ctx.moveTo(200, 0)
    ctx.lineTo(200, canvas.height)
    ctx.stroke()
    ctx.setLineDash([]) // Reset for other drawings

    // Player car
    ctx.fillStyle = '#ff4757'
    ctx.fillRect(g.player.x, g.player.y, g.player.w, g.player.h)

    // Enemy cars
    ctx.fillStyle = '#3498db'
    g.cars.forEach(car => {
      ctx.fillRect(car.x, car.y, car.w, car.h)
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
      gameRef.current.keys[e.key] = true
      if ((e.key === ' ' || e.key === 'Enter') && (gameState === 'idle' || gameState === 'gameOver')) {
        startGame()
      }
    }
    const handleKeyUp = (e) => {
      gameRef.current.keys[e.key] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
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
          width="400" 
          height="600"
          style={{ maxWidth: '100%', height: 'auto', background: '#333', borderRadius: '8px', border: '3px solid #ff4757' }}
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

export default CarRacing
