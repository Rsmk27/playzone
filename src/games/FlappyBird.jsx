import { useState, useEffect, useRef } from 'react'

function FlappyBird() {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [gameState, setGameState] = useState('idle') // idle, playing, gameOver
  const [info, setInfo] = useState('Press Start to play!')

  const gameRef = useRef({
    bird: { x: 100, y: 250, v: 0 },
    pipes: [],
    t: 0,
    pts: 0,
    alive: true,
    animationId: null
  })

  const spawnPipe = (width) => {
    const gap = 140
    const top = 60 + Math.random() * 260
    return { x: width, top: top, gap: gap }
  }

  const resetGame = () => {
    gameRef.current = {
      bird: { x: 100, y: 250, v: 0 },
      pipes: [],
      t: 0,
      pts: 0,
      alive: true,
      animationId: null
    }
    setScore(0)
    setInfo('Tap or press Space to flap.')
  }

  const startGame = () => {
    resetGame()
    setGameState('playing')
  }

  useEffect(() => {
    if (gameState !== 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const step = () => {
      const g = gameRef.current
      if (g.alive) {
        g.t++
        if (g.t % 90 === 0) g.pipes.push(spawnPipe(canvas.width))
        
        // Physics
        g.bird.v += 0.5
        g.bird.y += g.bird.v
        
        // Collision ground/sky
        if (g.bird.y < 0 || g.bird.y > canvas.height) {
          g.alive = false
        }
        
        // Move & collide pipes
        g.pipes.forEach(p => { p.x -= 2 })
        g.pipes = g.pipes.filter(p => p.x > -60)
        
        g.pipes.forEach(p => {
          const inX = g.bird.x > p.x - 20 && g.bird.x < p.x + 60
          const hitTop = g.bird.y < p.top
          const hitBottom = g.bird.y > (p.top + p.gap)
          if (inX && (hitTop || hitBottom)) g.alive = false
          if (p.x + 60 === Math.floor(g.bird.x)) {
            g.pts++
            setScore(g.pts)
          }
        })
      } else {
        setGameState('gameOver')
        setInfo('Crashed! Press Start to try again.')
        return
      }

      draw(ctx, canvas.width, canvas.height)
      g.animationId = requestAnimationFrame(step)
    }

    g.animationId = requestAnimationFrame(step)

    return () => {
      if (gameRef.current.animationId) cancelAnimationFrame(gameRef.current.animationId)
    }
  }, [gameState])

  const draw = (ctx, width, height) => {
    const g = gameRef.current
    
    ctx.fillStyle = '#0b0f1a'
    ctx.fillRect(0, 0, width, height)

    // Bird
    ctx.fillStyle = '#a78bfa'
    ctx.fillRect(g.bird.x - 10, g.bird.y - 10, 20, 20)

    // Pipes
    ctx.fillStyle = '#6ee7ff'
    g.pipes.forEach(p => {
      ctx.fillRect(p.x, 0, 60, p.top)
      ctx.fillRect(p.x, p.top + p.gap, 60, height - (p.top + p.gap))
    })
  }

  const flap = () => {
    if (gameState === 'playing' && gameRef.current.alive) {
      gameRef.current.bird.v = -7
    } else if (gameState === 'idle' || gameState === 'gameOver') {
      startGame()
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        flap()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState])

  // Initial draw
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      draw(ctx, canvas.width, canvas.height)
    }
  }, [])

  return (
    <div className="game-container">
      <div className="tally">
        <span>Score: {score}</span>
      </div>
      <div className="info">{info}</div>
      <div className="canvas-wrap">
        <canvas 
          ref={canvasRef} 
          width="420" 
          height="560"
          style={{ maxWidth: '100%', height: 'auto', touchAction: 'none' }}
          onMouseDown={flap}
          onTouchStart={(e) => { e.preventDefault(); flap(); }}
        />
      </div>
      <div className="game-controls">
        <button className="game-btn" onClick={startGame}>
          {gameState === 'playing' ? 'Restart' : 'Start Game'}
        </button>
      </div>
    </div>
  )
}

export default FlappyBird
