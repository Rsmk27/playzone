import { useState, useEffect, useRef } from 'react'

function Pong() {
  const canvasRef = useRef(null)
  const [playerScore, setPlayerScore] = useState(0)
  const [cpuScore, setCpuScore] = useState(0)
  const [gameState, setGameState] = useState('idle') // idle, playing, paused
  const [info, setInfo] = useState('Press Start to play!')

  const gameRef = useRef({
    ball: { x: 400, y: 250, dx: 4, dy: 4, radius: 8 },
    player: { x: 20, y: 200, width: 10, height: 100 },
    cpu: { x: 770, y: 200, width: 10, height: 100 },
    keys: {},
    animationId: null
  })

  const resetBall = () => {
    const g = gameRef.current
    g.ball.x = 400
    g.ball.y = 250
    g.ball.dx = (Math.random() > 0.5 ? 1 : -1) * 4
    g.ball.dy = (Math.random() - 0.5) * 6
  }

  const startGame = () => {
    setPlayerScore(0)
    setCpuScore(0)
    resetBall()
    setGameState('playing')
    setInfo('Use W/S or Arrow keys to move.')
  }

  const togglePause = () => {
    setGameState(prev => {
      if (prev === 'playing') return 'paused'
      if (prev === 'paused') return 'playing'
      return prev
    })
  }

  useEffect(() => {
    if (gameState !== 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const step = () => {
      const g = gameRef.current
      
      // Player movement
      if ((g.keys['ArrowUp'] || g.keys['w'] || g.keys['W']) && g.player.y > 0) {
        g.player.y -= 6
      }
      if ((g.keys['ArrowDown'] || g.keys['s'] || g.keys['S']) && g.player.y < canvas.height - g.player.height) {
        g.player.y += 6
      }

      // CPU AI
      if (g.ball.x > canvas.width / 2) {
        if (g.cpu.y + g.cpu.height / 2 < g.ball.y - 20) g.cpu.y += 4
        else if (g.cpu.y + g.cpu.height / 2 > g.ball.y + 20) g.cpu.y -= 4
      }

      // Ball movement
      g.ball.x += g.ball.dx
      g.ball.y += g.ball.dy

      // Ball collision with top/bottom
      if (g.ball.y - g.ball.radius < 0 || g.ball.y + g.ball.radius > canvas.height) {
        g.ball.dy *= -1
      }

      // Ball collision with paddles
      if (g.ball.x - g.ball.radius < g.player.x + g.player.width &&
          g.ball.y > g.player.y && g.ball.y < g.player.y + g.player.height) {
        g.ball.dx = Math.abs(g.ball.dx)
        g.ball.dx *= 1.05
      }
      if (g.ball.x + g.ball.radius > g.cpu.x &&
          g.ball.y > g.cpu.y && g.ball.y < g.cpu.y + g.cpu.height) {
        g.ball.dx = -Math.abs(g.ball.dx)
        g.ball.dx *= 1.05
      }

      // Scoring
      if (g.ball.x < 0) {
        setCpuScore(s => s + 1)
        resetBall()
      }
      if (g.ball.x > canvas.width) {
        setPlayerScore(s => s + 1)
        resetBall()
      }

      draw(ctx, canvas.width, canvas.height)
      g.animationId = requestAnimationFrame(step)
    }

    g.animationId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(gameRef.current.animationId)
  }, [gameState])

  const draw = (ctx, width, height) => {
    const g = gameRef.current
    
    ctx.fillStyle = '#1a1f3a'
    ctx.fillRect(0, 0, width, height)

    // Center line
    ctx.strokeStyle = '#333'
    ctx.setLineDash([10, 10])
    ctx.beginPath()
    ctx.moveTo(width / 2, 0)
    ctx.lineTo(width / 2, height)
    ctx.stroke()
    ctx.setLineDash([])

    // Ball
    ctx.fillStyle = '#4ade80'
    ctx.beginPath()
    ctx.arc(g.ball.x, g.ball.y, g.ball.radius, 0, Math.PI * 2)
    ctx.fill()

    // Paddles
    ctx.fillStyle = '#fff'
    ctx.fillRect(g.player.x, g.player.y, g.player.width, g.player.height)
    ctx.fillRect(g.cpu.x, g.cpu.y, g.cpu.width, g.cpu.height)

    if (gameState === 'paused') {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(0, 0, width, height)
      ctx.fillStyle = '#fff'
      ctx.font = '30px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('PAUSED', width / 2, height / 2)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      gameRef.current.keys[e.key] = true
      if (e.key === 'p' || e.key === 'P') togglePause()
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
  }, [])

  const handleTouch = (e) => {
    if (gameState !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const relY = touch.clientY - rect.top
    const scaleY = canvas.height / rect.height
    gameRef.current.player.y = Math.max(0, Math.min((relY * scaleY) - gameRef.current.player.height / 2, canvas.height - gameRef.current.player.height))
  }

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
        <span>Player: {playerScore}</span>
        <span>CPU: {cpuScore}</span>
      </div>
      <div className="info">{info}</div>
      <div className="canvas-wrap">
        <canvas 
          ref={canvasRef} 
          width="800" 
          height="500"
          style={{ maxWidth: '100%', height: 'auto', touchAction: 'none' }}
          onTouchMove={(e) => { e.preventDefault(); handleTouch(e); }}
        />
      </div>
      <div className="game-controls">
        {gameState === 'idle' ? (
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

export default Pong
