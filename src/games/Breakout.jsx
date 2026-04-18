import { useState, useEffect, useRef } from 'react'

function Breakout() {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(1)
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('breakoutHighScore') || '0'))
  const [gameState, setGameState] = useState('idle') // idle, playing, paused, levelComplete, gameOver
  const [info, setInfo] = useState('Press Start to play!')

  const gameRef = useRef({
    x: 240, y: 290, dx: 2, dy: -2, r: 7,
    paddleH: 10, paddleW: 75, px: (480 - 75) / 2,
    right: false, left: false,
    rows: 5, cols: 7, bw: 50, bh: 16, pad: 8, offsetTop: 30, offsetLeft: 30,
    bricks: [],
    particles: [],
    animationId: null
  })

  const brickColors = [
    { color: '#ff6b6b', points: 50 },
    { color: '#ffd93d', points: 40 },
    { color: '#6bcf7f', points: 30 },
    { color: '#4dabf7', points: 20 },
    { color: '#a78bfa', points: 10 }
  ]

  const setupBricks = () => {
    const { cols, rows } = gameRef.current
    const bricks = []
    for (let c = 0; c < cols; c++) {
      bricks[c] = []
      for (let r = 0; r < rows; r++) {
        bricks[c][r] = {
          alive: true,
          color: brickColors[r].color,
          points: brickColors[r].points
        }
      }
    }
    gameRef.current.bricks = bricks
  }

  const resetBallAndPaddle = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    gameRef.current.x = canvas.width / 2
    gameRef.current.y = canvas.height - 30
    gameRef.current.dx = 2 * (Math.random() > 0.5 ? 1 : -1)
    gameRef.current.dy = -2
    gameRef.current.px = (canvas.width - gameRef.current.paddleW) / 2
  }

  const startGame = () => {
    setScore(0)
    setLives(3)
    setLevel(1)
    setupBricks()
    resetBallAndPaddle()
    setGameState('playing')
    setInfo('Level 1 - Good luck!')
  }

  const nextLevel = () => {
    const nextLvl = level + 1
    setLevel(nextLvl)
    setupBricks()
    resetBallAndPaddle()
    gameRef.current.dx *= (1 + nextLvl * 0.1)
    gameRef.current.dy *= (1 + nextLvl * 0.1)
    setGameState('playing')
    setInfo(`Level ${nextLvl} - Speed increased!`)
  }

  const togglePause = () => {
    setGameState(prev => {
      if (prev === 'playing') return 'paused'
      if (prev === 'paused') return 'playing'
      return prev
    })
  }

  useEffect(() => {
    if (gameState !== 'playing' && gameState !== 'levelComplete') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const step = () => {
      const g = gameRef.current
      
      // Clear
      ctx.fillStyle = '#0b0f1a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      drawBricks(ctx)
      drawParticles(ctx)
      drawBall(ctx)
      drawPaddle(ctx)

      if (gameState === 'playing') {
        updateParticles()
        
        // Wall collision
        if (g.x + g.r > canvas.width || g.x - g.r < 0) g.dx = -g.dx
        if (g.y - g.r < 0) g.dy = -g.dy

        // Paddle collision
        if (g.y + g.r > canvas.height - g.paddleH - 5 && g.y + g.r < canvas.height - g.paddleH && g.x > g.px && g.x < g.px + g.paddleW) {
          g.dy = -g.dy
          const hitPos = (g.x - g.px) / g.paddleW
          g.dx = (hitPos - 0.5) * 6
        }

        // Brick collision
        for (let c = 0; c < g.cols; c++) {
          for (let r = 0; r < g.rows; r++) {
            const b = g.bricks[c][r]
            if (b.alive) {
              const bx = (c * (g.bw + g.pad)) + g.offsetLeft
              const by = (r * (g.bh + g.pad)) + g.offsetTop
              if (g.x > bx && g.x < bx + g.bw && g.y > by && g.y < by + g.bh) {
                g.dy = -g.dy
                b.alive = false
                setScore(s => s + b.points)
                createParticles(bx + g.bw / 2, by + g.bh / 2, b.color)
                
                if (checkLevelComplete()) {
                  setGameState('levelComplete')
                  setInfo('Level Complete! Press Next Level to continue.')
                  return
                }
              }
            }
          }
        }

        // Missed ball
        if (g.y + g.r > canvas.height) {
          setLives(l => {
            if (l <= 1) {
              setGameState('gameOver')
              setInfo('Game Over!')
              return 0
            }
            resetBallAndPaddle()
            setInfo(`Life lost! ${l - 1} remaining.`)
            return l - 1
          })
        }

        g.x += g.dx
        g.y += g.dy

        if (g.right) g.px = Math.min(g.px + 5, canvas.width - g.paddleW)
        if (g.left) g.px = Math.max(g.px - 5, 0)
      } else if (gameState === 'levelComplete') {
        updateParticles()
      }

      g.animationId = requestAnimationFrame(step)
    }

    g.animationId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(gameRef.current.animationId)
  }, [gameState, level])

  const drawBall = (ctx) => {
    const { x, y, r } = gameRef.current
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = '#a78bfa'
    ctx.fill()
    ctx.closePath()
  }

  const drawPaddle = (ctx) => {
    const { px, paddleW, paddleH } = gameRef.current
    const canvas = canvasRef.current
    ctx.fillStyle = '#6ee7ff'
    ctx.fillRect(px, canvas.height - paddleH - 5, paddleW, paddleH)
  }

  const drawBricks = (ctx) => {
    const g = gameRef.current
    for (let c = 0; c < g.cols; c++) {
      for (let r = 0; r < g.rows; r++) {
        const b = g.bricks[c][r]
        if (b && b.alive) {
          const bx = (c * (g.bw + g.pad)) + g.offsetLeft
          const by = (r * (g.bh + g.pad)) + g.offsetTop
          ctx.fillStyle = b.color
          ctx.fillRect(bx, by, g.bw, g.bh)
        }
      }
    }
  }

  const createParticles = (x, y, color) => {
    for (let i = 0; i < 8; i++) {
      gameRef.current.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1,
        color
      })
    }
  }

  const updateParticles = () => {
    gameRef.current.particles = gameRef.current.particles.filter(p => {
      p.x += p.vx
      p.y += p.vy
      p.life -= 0.02
      return p.life > 0
    })
  }

  const drawParticles = (ctx) => {
    gameRef.current.particles.forEach(p => {
      ctx.fillStyle = p.color
      ctx.globalAlpha = p.life
      ctx.fillRect(p.x, p.y, 3, 3)
    })
    ctx.globalAlpha = 1
  }

  const checkLevelComplete = () => {
    return gameRef.current.bricks.every(col => col.every(b => !b.alive))
  }

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('breakoutHighScore', score.toString())
    }
  }, [score, highScore])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') gameRef.current.right = true
      if (e.key === 'ArrowLeft') gameRef.current.left = true
      if (e.key === 'p' || e.key === 'P') togglePause()
    }
    const handleKeyUp = (e) => {
      if (e.key === 'ArrowRight') gameRef.current.right = false
      if (e.key === 'ArrowLeft') gameRef.current.left = false
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const handleMouseMove = (e) => {
    if (gameState !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const relX = e.clientX - rect.left
    const scaleX = canvas.width / rect.width
    gameRef.current.px = Math.max(0, Math.min((relX * scaleX) - gameRef.current.paddleW / 2, canvas.width - gameRef.current.paddleW))
  }

  // Initial draw
  useEffect(() => {
    setupBricks()
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#0b0f1a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      drawBricks(ctx)
      drawPaddle(ctx)
      drawBall(ctx)
    }
  }, [])

  return (
    <div className="game-container">
      <div className="tally">
        <span>Score: {score}</span>
        <span>Lives: {lives}</span>
        <span>Level: {level}</span>
        <span>High: {highScore}</span>
      </div>
      <div className="info">{info}</div>
      <div className="canvas-wrap">
        <canvas 
          ref={canvasRef} 
          width="480" 
          height="320"
          style={{ maxWidth: '100%', height: 'auto', touchAction: 'none' }}
          onMouseMove={handleMouseMove}
          onTouchMove={(e) => {
            const touch = e.touches[0];
            handleMouseMove({ clientX: touch.clientX });
          }}
        />
      </div>
      <div className="game-controls">
        {gameState === 'idle' || gameState === 'gameOver' ? (
          <button className="game-btn" onClick={startGame}>Start Game</button>
        ) : gameState === 'levelComplete' ? (
          <button className="game-btn" onClick={nextLevel}>Next Level</button>
        ) : (
          <button className="game-btn" onClick={togglePause}>
            {gameState === 'paused' ? 'Resume' : 'Pause'}
          </button>
        )}
        <button className="game-btn" onClick={startGame}>Reset</button>
      </div>
    </div>
  )
}

export default Breakout
