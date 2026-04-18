import { useState, useEffect, useRef } from 'react'

function Snake() {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('snakeHighScore') || '0'))
  const [gameState, setGameState] = useState('idle') // idle, playing, paused, gameOver
  const [info, setInfo] = useState('Press Start to play!')

  const gameRef = useRef({
    snake: [{ x: 10, y: 10 }],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food: { x: 15, y: 10 },
    speed: 120,
    timer: null,
    pts: 0,
    size: 20,
    cols: 20,
    rows: 20
  })

  const spawnFood = (cols, rows) => {
    return {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows)
    }
  }

  const resetGame = () => {
    const cols = 20
    const rows = 20
    gameRef.current = {
      ...gameRef.current,
      snake: [{ x: 10, y: 10 }],
      dir: { x: 1, y: 0 },
      nextDir: { x: 1, y: 0 },
      food: spawnFood(cols, rows),
      speed: 120,
      pts: 0
    }
    setScore(0)
    setInfo('Use arrow keys to move. Eat the squares.')
  }

  const startGame = () => {
    resetGame()
    setGameState('playing')
  }

  const togglePause = () => {
    setGameState(prev => {
      if (prev === 'playing') return 'paused'
      if (prev === 'paused') return 'playing'
      return prev
    })
  }

  useEffect(() => {
    if (gameState !== 'playing') {
      if (gameRef.current.timer) {
        clearInterval(gameRef.current.timer)
        gameRef.current.timer = null
      }
      if (gameState === 'paused') {
        setInfo('Game paused. Press Space to resume.')
      }
      draw()
      return
    }

    const step = () => {
      const g = gameRef.current
      g.dir = g.nextDir
      const head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y }

      // Wrap
      head.x = (head.x + g.cols) % g.cols
      head.y = (head.y + g.rows) % g.rows

      // Collide with self
      if (g.snake.some((s, i) => i !== 0 && s.x === head.x && s.y === head.y)) {
        gameOver()
        return
      }

      g.snake.unshift(head)

      if (head.x === g.food.x && head.y === g.food.y) {
        g.pts++
        setScore(g.pts)
        g.food = spawnFood(g.cols, g.rows)
        if (g.speed > 60) {
          g.speed -= 4
          clearInterval(g.timer)
          g.timer = setInterval(step, g.speed)
        }
      } else {
        g.snake.pop()
      }

      draw()
    }

    const gameOver = () => {
      setGameState('gameOver')
      clearInterval(gameRef.current.timer)
      gameRef.current.timer = null
      
      if (gameRef.current.pts > highScore) {
        setHighScore(gameRef.current.pts)
        localStorage.setItem('snakeHighScore', gameRef.current.pts.toString())
        setInfo('🎉 New High Score! Game over.')
      } else {
        setInfo('Game over!')
      }
    }

    gameRef.current.timer = setInterval(step, gameRef.current.speed)
    setInfo('Use arrow keys to move. Eat the squares.')

    return () => {
      if (gameRef.current.timer) clearInterval(gameRef.current.timer)
    }
  }, [gameState, highScore])

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const g = gameRef.current
    const size = g.size

    ctx.fillStyle = '#0b0f1a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Food
    ctx.fillStyle = '#6ee7ff'
    ctx.fillRect(g.food.x * size, g.food.y * size, size, size)

    // Snake
    g.snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? '#c4b5fd' : '#a78bfa'
      ctx.fillRect(s.x * size, s.y * size, size - 1, size - 1)
      if (i === 0) {
        ctx.fillStyle = '#a78bfa'
        ctx.fillRect(s.x * size + 6, s.y * size + 6, 8, 8)
      }
    })

    if (gameState === 'paused') {
      ctx.fillStyle = 'rgba(0,0,0,0.7)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#fff'
      ctx.font = '30px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2)
      ctx.font = '16px system-ui'
      ctx.fillText('Press SPACE to resume', canvas.width / 2, canvas.height / 2 + 30)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'Escape') {
        if (gameState === 'playing' || gameState === 'paused') {
          togglePause()
        } else if (gameState === 'idle' || gameState === 'gameOver') {
          startGame()
        }
        return
      }

      if (gameState !== 'playing') return

      const g = gameRef.current
      if (e.key === 'ArrowUp' && g.dir.y !== 1) g.nextDir = { x: 0, y: -1 }
      if (e.key === 'ArrowDown' && g.dir.y !== -1) g.nextDir = { x: 0, y: 1 }
      if (e.key === 'ArrowLeft' && g.dir.x !== 1) g.nextDir = { x: -1, y: 0 }
      if (e.key === 'ArrowRight' && g.dir.x !== -1) g.nextDir = { x: 1, y: 0 }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState])

  // Initial draw
  useEffect(() => {
    draw()
  }, [])

  return (
    <div className="game-container">
      <div className="tally">
        <span>Score: {score}</span>
        <span>High Score: {highScore}</span>
      </div>
      <div className="info">{info}</div>
      <div className="canvas-wrap">
        <canvas 
          ref={canvasRef} 
          width="400" 
          height="400"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
      <div className="game-controls">
        {gameState === 'idle' || gameState === 'gameOver' ? (
          <button className="game-btn" onClick={startGame}>Start Game</button>
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

export default Snake
