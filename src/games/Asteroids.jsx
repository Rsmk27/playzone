import { useState, useEffect, useRef } from 'react'

function Asteroids() {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [gameState, setGameState] = useState('idle') // idle, playing, gameOver
  const [info, setInfo] = useState('Press Start to play!')

  const gameRef = useRef({
    ship: { x: 300, y: 200, angle: 0, vx: 0, vy: 0 },
    asteroids: [],
    bullets: [],
    keys: {},
    requestRef: null
  })

  const startGame = () => {
    gameRef.current = {
      ship: { x: 300, y: 200, angle: 0, vx: 0, vy: 0 },
      asteroids: [],
      bullets: [],
      keys: {},
      requestRef: null,
      score: 0
    }
    
    // Initial asteroids
    for (let i = 0; i < 5; i++) {
      gameRef.current.asteroids.push({
        x: Math.random() * 600,
        y: Math.random() * 400,
        vx: Math.random() * 2 - 1,
        vy: Math.random() * 2 - 1,
        size: 30
      })
    }
    
    setScore(0)
    setGameState('playing')
    setInfo('Arrows to move, Space to shoot.')
  }

  const shoot = () => {
    if (gameState !== 'playing') return
    const g = gameRef.current
    const vx = Math.cos(g.ship.angle) * 8
    const vy = Math.sin(g.ship.angle) * 8
    g.bullets.push({ x: g.ship.x, y: g.ship.y, vx, vy, life: 50 })
  }

  const update = () => {
    if (gameState !== 'playing') return

    const g = gameRef.current
    const canvas = canvasRef.current
    if (!canvas) return

    // Ship rotation and movement
    if (g.keys['ArrowLeft']) g.ship.angle -= 0.1
    if (g.keys['ArrowRight']) g.ship.angle += 0.1
    if (g.keys['ArrowUp']) {
      g.ship.vx += Math.cos(g.ship.angle) * 0.3
      g.ship.vy += Math.sin(g.ship.angle) * 0.3
    }
    
    g.ship.x += g.ship.vx
    g.ship.y += g.ship.vy
    g.ship.vx *= 0.99
    g.ship.vy *= 0.99

    // Ship wrap
    if (g.ship.x < 0) g.ship.x = canvas.width
    if (g.ship.x > canvas.width) g.ship.x = 0
    if (g.ship.y < 0) g.ship.y = canvas.height
    if (g.ship.y > canvas.height) g.ship.y = 0

    // Bullets
    for (let i = g.bullets.length - 1; i >= 0; i--) {
      const b = g.bullets[i]
      b.x += b.vx
      b.y += b.vy
      b.life--
      if (b.life <= 0) {
        g.bullets.splice(i, 1)
      }
    }

    // Asteroids
    for (let i = g.asteroids.length - 1; i >= 0; i--) {
      const a = g.asteroids[i]
      a.x += a.vx
      a.y += a.vy
      
      // Wrap
      if (a.x < 0) a.x = canvas.width
      if (a.x > canvas.width) a.x = 0
      if (a.y < 0) a.y = canvas.height
      if (a.y > canvas.height) a.y = 0

      // Collision with ship
      const dist = Math.hypot(g.ship.x - a.x, g.ship.y - a.y)
      if (dist < a.size + 10) {
        setGameState('gameOver')
        setInfo(`Game Over! Final Score: ${gameRef.current.score || 0}`)
        return
      }

      // Collision with bullets
      for (let j = g.bullets.length - 1; j >= 0; j--) {
        const b = g.bullets[j]
        const bdist = Math.hypot(b.x - a.x, b.y - a.y)
        if (bdist < a.size) {
          g.asteroids.splice(i, 1)
          g.bullets.splice(j, 1)
          g.score = (g.score || 0) + 10
          setScore(g.score)
          break
        }
      }
    }

    if (g.asteroids.length === 0 && gameState === 'playing') {
        // Respawn more asteroids to keep the game going, or win
        for (let i = 0; i < 5; i++) {
            g.asteroids.push({
              x: Math.random() * canvas.width,
              y: Math.random() * canvas.height,
              vx: Math.random() * 2 - 1,
              vy: Math.random() * 2 - 1,
              size: 30
            })
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

    ctx.fillStyle = '#0b0f1a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Ship
    ctx.save()
    ctx.translate(g.ship.x, g.ship.y)
    ctx.rotate(g.ship.angle)
    ctx.strokeStyle = '#6ee7ff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(15, 0)
    ctx.lineTo(-10, -8)
    ctx.lineTo(-10, 8)
    ctx.closePath()
    ctx.stroke()
    ctx.restore()

    // Bullets
    ctx.fillStyle = '#fff'
    g.bullets.forEach(b => {
      ctx.fillRect(b.x - 2, b.y - 2, 4, 4)
    })

    // Asteroids
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    g.asteroids.forEach(a => {
      ctx.beginPath()
      ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2)
      ctx.stroke()
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
      if (e.key === ' ') {
          if (gameState === 'playing') shoot()
          else if (gameState === 'idle' || gameState === 'gameOver') startGame()
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
          width="600" 
          height="400"
          style={{ maxWidth: '100%', height: 'auto', background: '#0b0f1a', borderRadius: '8px' }}
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

export default Asteroids
