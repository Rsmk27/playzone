import { useState, useEffect, useRef } from 'react'

function Shooter2D() {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [hp, setHp] = useState(100)
  const [gameState, setGameState] = useState('idle') // idle, playing, gameOver
  const [info, setInfo] = useState('Press Start to play!')

  const gameRef = useRef({
    player: { x: 300, y: 350, size: 20 },
    bullets: [],
    enemies: [],
    keys: {},
    frame: 0,
    requestRef: null,
    score: 0,
    hp: 100
  })

  const startGame = () => {
    gameRef.current = {
      player: { x: 300, y: 350, size: 20 },
      bullets: [],
      enemies: [],
      keys: {},
      frame: 0,
      requestRef: null,
      score: 0,
      hp: 100
    }
    setScore(0)
    setHp(100)
    setGameState('playing')
    setInfo('WASD to move, Click or Space to shoot.')
  }

  const shoot = () => {
    if (gameState !== 'playing') return
    const g = gameRef.current
    g.bullets.push({ x: g.player.x, y: g.player.y })
  }

  const update = () => {
    if (gameState !== 'playing') return

    const g = gameRef.current
    const canvas = canvasRef.current
    if (!canvas) return

    g.frame++

    // Player movement
    const speed = 5
    if (g.keys['a'] || g.keys['ArrowLeft']) if (g.player.x > 0) g.player.x -= speed
    if (g.keys['d'] || g.keys['ArrowRight']) if (g.player.x < canvas.width) g.player.x += speed
    if (g.keys['w'] || g.keys['ArrowUp']) if (g.player.y > 0) g.player.y -= speed
    if (g.keys['s'] || g.keys['ArrowDown']) if (g.player.y < canvas.height) g.player.y += speed

    // Bullets
    for (let i = g.bullets.length - 1; i >= 0; i--) {
      g.bullets[i].y -= 8
      if (g.bullets[i].y < 0) {
        g.bullets.splice(i, 1)
      }
    }

    // Spawn enemies
    if (g.frame % 60 === 0) {
      g.enemies.push({ x: Math.random() * canvas.width, y: 0, size: 20 })
    }

    // Enemies
    for (let i = g.enemies.length - 1; i >= 0; i--) {
      const e = g.enemies[i]
      e.y += 2

      if (e.y > canvas.height) {
        g.enemies.splice(i, 1)
        g.hp -= 10
        setHp(g.hp)
        if (g.hp <= 0) {
          setGameState('gameOver')
          setInfo(`Game Over! Score: ${g.score}`)
          return
        }
        continue
      }

      // Enemy-Bullet collision
      for (let j = g.bullets.length - 1; j >= 0; j--) {
        const b = g.bullets[j]
        if (Math.abs(b.x - e.x) < 15 && Math.abs(b.y - e.y) < 15) {
          g.enemies.splice(i, 1)
          g.bullets.splice(j, 1)
          g.score += 10
          setScore(g.score)
          break
        }
      }

      // Enemy-Player collision
      if (Math.abs(g.player.x - e.x) < 20 && Math.abs(g.player.y - e.y) < 20) {
        g.hp -= 5
        setHp(g.hp)
        g.enemies.splice(i, 1)
        if (g.hp <= 0) {
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

    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Player
    ctx.fillStyle = '#4ade80'
    ctx.fillRect(g.player.x - g.player.size / 2, g.player.y - g.player.size / 2, g.player.size, g.player.size)

    // Bullets
    ctx.fillStyle = '#fbbf24'
    g.bullets.forEach(b => {
      ctx.fillRect(b.x - 2, b.y - 5, 4, 10)
    })

    // Enemies
    ctx.fillStyle = '#ef4444'
    g.enemies.forEach(e => {
      ctx.fillRect(e.x - e.size / 2, e.y - e.size / 2, e.size, e.size)
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
      gameRef.current.keys[e.key.toLowerCase()] = true
      if (e.key === ' ') {
        if (gameState === 'playing') shoot()
        else if (gameState === 'idle' || gameState === 'gameOver') startGame()
      }
    }
    const handleKeyUp = (e) => {
      gameRef.current.keys[e.key.toLowerCase()] = false
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
        <span>HP: {hp}</span>
      </div>
      <div className="info">{info}</div>
      <div className="canvas-wrap">
        <canvas 
          ref={canvasRef} 
          width="600" 
          height="400"
          onClick={shoot}
          style={{ maxWidth: '100%', height: 'auto', background: '#1a1a2e', borderRadius: '8px', border: '3px solid #ff4757' }}
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

export default Shooter2D
