import { useState, useEffect, useRef } from 'react'

function SpaceInvaders() {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(1)
  const [gameState, setGameState] = useState('idle') // idle, playing, gameOver
  const [info, setInfo] = useState('Press Start to play!')

  const gameRef = useRef({
    player: { x: 275, y: 350, w: 50, h: 20 },
    aliens: [],
    bullets: [],
    alienBullets: [],
    keys: {},
    alienSpeed: 0.5,
    shootTimer: 0,
    animationId: null
  })

  const spawnAliens = (lvl) => {
    const rows = Math.min(5 + Math.floor(lvl / 2), 8)
    const cols = 8
    const aliens = []
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        aliens.push({ x: j * 70 + 30, y: i * 40 + 30, w: 40, h: 30 })
      }
    }
    gameRef.current.aliens = aliens
  }

  const startGame = () => {
    setScore(0)
    setLives(3)
    setLevel(1)
    gameRef.current.player.x = 275
    gameRef.current.alienSpeed = 0.5
    gameRef.current.bullets = []
    gameRef.current.alienBullets = []
    spawnAliens(1)
    setGameState('playing')
    setInfo('Use Arrows to move, Space to shoot.')
  }

  useEffect(() => {
    if (gameState !== 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const step = () => {
      const g = gameRef.current
      
      // Player movement
      if (g.keys['ArrowLeft'] && g.player.x > 0) g.player.x -= 5
      if (g.keys['ArrowRight'] && g.player.x < canvas.width - g.player.w) g.player.x += 5

      // Player bullets
      g.bullets.forEach((b, i) => {
        b.y -= 7
        if (b.y < 0) {
          g.bullets.splice(i, 1)
        } else {
          g.aliens.forEach((a, j) => {
            if (b.x > a.x && b.x < a.x + a.w && b.y > a.y && b.y < a.y + a.h) {
              g.aliens.splice(j, 1)
              g.bullets.splice(i, 1)
              setScore(s => s + 10)
            }
          })
        }
      })

      // Alien shooting
      g.shootTimer++
      if (g.shootTimer > 60 && g.aliens.length > 0 && Math.random() < 0.02) {
        const alien = g.aliens[Math.floor(Math.random() * g.aliens.length)]
        g.alienBullets.push({ x: alien.x + alien.w / 2, y: alien.y + alien.h })
        g.shootTimer = 0
      }

      // Alien bullets
      g.alienBullets.forEach((b, i) => {
        b.y += 4
        if (b.y > canvas.height) {
          g.alienBullets.splice(i, 1)
        } else {
          if (b.x > g.player.x && b.x < g.player.x + g.player.w && b.y > g.player.y && b.y < g.player.y + g.player.h) {
            g.alienBullets.splice(i, 1)
            setLives(l => {
              if (l <= 1) {
                setGameState('gameOver')
                setInfo('Game Over!')
                return 0
              }
              g.player.x = 275
              return l - 1
            })
          }
        }
      })

      // Alien movement
      let reachedBottom = false
      g.aliens.forEach(a => {
        a.y += g.alienSpeed
        if (a.y + a.h > g.player.y) reachedBottom = true
      })

      if (reachedBottom) {
        setGameState('gameOver')
        setInfo('Aliens reached the bottom! Game Over.')
      }

      if (g.aliens.length === 0) {
        setLevel(l => {
          const nextLvl = l + 1
          g.alienSpeed += 0.1
          spawnAliens(nextLvl)
          return nextLvl
        })
      }

      draw(ctx, canvas.width, canvas.height)
      g.animationId = requestAnimationFrame(step)
    }

    g.animationId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(gameRef.current.animationId)
  }, [gameState])

  const draw = (ctx, width, height) => {
    const g = gameRef.current
    ctx.fillStyle = '#0a0e27'
    ctx.fillRect(0, 0, width, height)

    // Player
    ctx.fillStyle = '#fff'
    ctx.fillRect(g.player.x, g.player.y, g.player.w, g.player.h)

    // Player bullets
    ctx.fillStyle = '#4ade80'
    g.bullets.forEach(b => ctx.fillRect(b.x, b.y, 3, 10))

    // Alien bullets
    ctx.fillStyle = '#f87171'
    g.alienBullets.forEach(b => ctx.fillRect(b.x, b.y, 3, 10))

    // Aliens
    ctx.fillStyle = '#e74c3c'
    g.aliens.forEach(a => ctx.fillRect(a.x, a.y, a.w, a.h))
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      gameRef.current.keys[e.key] = true
      if (e.code === 'Space' && gameState === 'playing') {
        const g = gameRef.current
        if (g.bullets.length < 5) {
          g.bullets.push({ x: g.player.x + g.player.w / 2, y: g.player.y })
        }
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
        <span>Lives: {lives}</span>
        <span>Level: {level}</span>
      </div>
      <div className="info">{info}</div>
      <div className="canvas-wrap">
        <canvas 
          ref={canvasRef} 
          width="600" 
          height="400"
          style={{ maxWidth: '100%', height: 'auto', touchAction: 'none' }}
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

export default SpaceInvaders
