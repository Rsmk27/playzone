import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

const Platformer = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameActive, setGameActive] = useState(false);
  
  const gameStateRef = useRef({
    player: { x: 50, y: 320, w: 30, h: 40, vx: 0, vy: 0, grounded: false },
    platforms: [],
    coins: [],
    enemies: [],
    collected: [],
    keys: {},
    level: 1,
    score: 0,
    gameActive: false
  });

  const levels = [
    {
      platforms: [
        { x: 0, y: 360, w: 600, h: 40 },
        { x: 150, y: 280, w: 100, h: 20 },
        { x: 300, y: 200, w: 100, h: 20 },
        { x: 450, y: 280, w: 100, h: 20 }
      ],
      coins: [
        { x: 180, y: 250 },
        { x: 330, y: 170 },
        { x: 480, y: 250 }
      ],
      enemies: [
        { x: 300, y: 160, w: 20, h: 20, dir: 1, range: 80, start: 300 }
      ]
    },
    {
      platforms: [
        { x: 0, y: 360, w: 200, h: 40 },
        { x: 250, y: 300, w: 100, h: 20 },
        { x: 400, y: 240, w: 150, h: 20 },
        { x: 100, y: 180, w: 100, h: 20 }
      ],
      coins: [
        { x: 280, y: 270 },
        { x: 450, y: 210 },
        { x: 130, y: 150 },
        { x: 530, y: 210 }
      ],
      enemies: [
        { x: 250, y: 260, w: 20, h: 20, dir: 1, range: 80, start: 250 },
        { x: 400, y: 200, w: 20, h: 20, dir: 1, range: 120, start: 400 }
      ]
    }
  ];

  const loadLevel = useCallback((lvl) => {
    const levelData = levels[Math.min(lvl - 1, levels.length - 1)];
    gameStateRef.current.platforms = JSON.parse(JSON.stringify(levelData.platforms));
    gameStateRef.current.coins = JSON.parse(JSON.stringify(levelData.coins)).map(c => ({ ...c, collected: false }));
    gameStateRef.current.enemies = JSON.parse(JSON.stringify(levelData.enemies));
    gameStateRef.current.level = lvl;
    setLevel(lvl);
  }, []);

  const startGame = () => {
    gameStateRef.current.player = { x: 50, y: 320, w: 30, h: 40, vx: 0, vy: 0, grounded: false };
    gameStateRef.current.score = 0;
    gameStateRef.current.gameActive = true;
    setScore(0);
    loadLevel(1);
    setGameActive(true);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      gameStateRef.current.keys[e.key] = true;
    };
    const handleKeyUp = (e) => {
      gameStateRef.current.keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const gameLoop = () => {
      const state = gameStateRef.current;
      if (!state.gameActive) return;

      // Clear
      ctx.fillStyle = '#93c5fd';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Player Movement
      if (state.keys['ArrowLeft']) state.player.vx = -5;
      else if (state.keys['ArrowRight']) state.player.vx = 5;
      else state.player.vx *= 0.8;

      if (state.keys['ArrowUp'] && state.player.grounded) {
        state.player.vy = -13;
        state.player.grounded = false;
      }

      state.player.vy += 0.7;
      state.player.x += state.player.vx;
      state.player.y += state.player.vy;

      // Bounds
      if (state.player.x < 0) state.player.x = 0;
      if (state.player.x + state.player.w > canvas.width) state.player.x = canvas.width - state.player.w;

      state.player.grounded = false;

      // Platforms
      ctx.fillStyle = '#22c55e';
      state.platforms.forEach(p => {
        ctx.fillRect(p.x, p.y, p.w, p.h);
        if (state.player.x + state.player.w > p.x && 
            state.player.x < p.x + p.w && 
            state.player.y + state.player.h > p.y && 
            state.player.y + state.player.h < p.y + 20 && 
            state.player.vy >= 0) {
          state.player.y = p.y - state.player.h;
          state.player.vy = 0;
          state.player.grounded = true;
        }
      });

      // Coins
      ctx.fillStyle = '#fbbf24';
      state.coins.forEach(c => {
        if (!c.collected) {
          ctx.beginPath();
          ctx.arc(c.x, c.y, 8, 0, Math.PI * 2);
          ctx.fill();

          if (state.player.x < c.x + 8 && state.player.x + state.player.w > c.x - 8 &&
              state.player.y < c.y + 8 && state.player.y + state.player.h > c.y - 8) {
            c.collected = true;
            state.score += 10;
            setScore(state.score);
            if (state.coins.every(coin => coin.collected)) {
              if (state.level < levels.length) {
                loadLevel(state.level + 1);
                state.player.x = 50;
                state.player.y = 320;
              } else {
                alert('You Win!');
                state.gameActive = false;
                setGameActive(false);
              }
            }
          }
        }
      });

      // Enemies
      ctx.fillStyle = '#ef4444';
      state.enemies.forEach(e => {
        e.x += e.dir * 2;
        if (Math.abs(e.x - e.start) > e.range) e.dir *= -1;
        ctx.fillRect(e.x, e.y, e.w, e.h);

        if (state.player.x < e.x + e.w && state.player.x + state.player.w > e.x &&
            state.player.y < e.y + e.h && state.player.y + state.player.h > e.y) {
          alert('Game Over!');
          state.gameActive = false;
          setGameActive(false);
        }
      });

      // Player Render
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(state.player.x, state.player.y, state.player.w, state.player.h);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    if (gameActive) {
      animationFrameId = requestAnimationFrame(gameLoop);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameActive, loadLevel]);

  return (
    <div className="page">
      <div className="game-header">
        <h1 className="game-title" style={{ color: '#fbbf24' }}>🏃 Platformer</h1>
        <div className="actions">
          <div className="score-box" style={{ background: '#fbbf24', color: '#000', padding: '5px 15px', borderRadius: '5px' }}>
            <span>Coins: {score} | Level: {level}</span>
          </div>
          <Link to="/" className="btn">← Back to Home</Link>
        </div>
      </div>

      <div className="canvas-wrap">
        <canvas
          ref={canvasRef}
          width="600"
          height="400"
          style={{
            border: '3px solid #fbbf24',
            background: '#93c5fd',
            display: 'block',
            maxWidth: '100%',
            height: 'auto'
          }}
        />
      </div>

      <div className="info" style={{ marginTop: '10px' }}>Use arrow keys to move and jump</div>

      <div className="game-controls">
        <button className="game-btn" onClick={startGame}>{gameActive ? 'Restart' : 'Start Game'}</button>
      </div>

      <div className="small" style={{ marginTop: '20px', textAlign: 'center' }}>
        PlayZone · React Platformer
      </div>
    </div>
  );
};

export default Platformer;
