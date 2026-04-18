import { useState, useEffect, useRef } from 'react'

function CatchObject() {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [gameState, setGameState] = useState('idle') // idle, playing, gameOver
  const [info, setInfo] = useState('Press Start to play!')

  const gameRef = useRef({
    basket: { x: 170, y: 450, w: 60, h: 20 },
    objects: [],
    requestRef: null,
    score: 0,
    keys: {}
  })

  const startGame = () => {
    gameRef.current = {
      basket: { x: 170, y: 450, w: 60, h: 20 },
      objects: [],
      requestRef: null,
      score: 0,
      keys: {}
    }
    setScore(0)
    setGameState('playing')
    setInfo('Move mouse or use ← → arrows to catch items.')
  }

  const update = () => {
    if (gameState !== 'playing') return

    const g = gameRef.current
    const canvas = canvasRef.current
    if (!canvas) return

    // Keyboard movement
    if (g.keys['ArrowLeft'] && g.basket.x > 0) g.basket.x -= 7
    if (g.keys['ArrowRight'] && g.basket.x < canvas.width - g.basket.w) g.basket.x += 7

    // Spawn objects
    if (Math.random() < 0.02) {
      g.objects.push({
        x: Math.random() * (canvas.width - 20) + 10,
        y: 0,
        size: 20,
        speed: 2 + Math.random() * 2
      })
    }

    // Objects
    for (let i = g.objects.length - 1; i >= 0; i--) {
      const o = g.objects[i]
      o.y += o.speed

      if (o.y > canvas.height) {
        g.objects.splice(i, 1)
        g.score = Math.max(0, g.score - 1)
        setScore(g.score)
        continue
      }

      // Collision
      if (
        o.y + o.size / 2 > g.basket.y &&
        o.y - o.size / 2 < g.basket.y + g.basket.h &&
        o.x > g.basket.x &&
        o.x < g.basket.x + g.basket.w
      ) {
        g.objects.splice(i, 1)
        g.score++
        setScore(g.score)
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

    ctx.fillStyle = '#e0f2fe'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Basket
    ctx.fillStyle = '#8b5cf6'
    ctx.fillRect(g.basket.x, g.basket.y, g.basket.w, g.basket.h)

    // Objects
    ctx.fillStyle = '#ef4444'
    g.objects.forEach(o => {
      ctx.beginPath()
      ctx.arc(o.x, o.y, o.size / 2, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  const handleMouseMove = (e) => {
    if (gameState !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const g = gameRef.current
    const relX = (e.clientX - rect.left) * (canvas.width / rect.width)
    g.basket.x = relX - g.basket.w / 2
    g.basket.x = Math.max(0, Math.min(canvas.width - g.basket.w, g.basket.x))
  }

  const handleTouchMove = (e) => {
    if (gameState !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const g = gameRef.current
    const touch = e.touches[0]
    const relX = (touch.clientX - rect.left) * (canvas.width / rect.width)
    g.basket.x = relX - g.basket.w / 2
    g.basket.x = Math.max(0, Math.min(canvas.width - g.basket.w, g.basket.x))
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
          height="500"
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          style={{ maxWidth: '100%', height: 'auto', background: '#e0f2fe', borderRadius: '8px', border: '3px solid #fff' }}
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

export default CatchObject
