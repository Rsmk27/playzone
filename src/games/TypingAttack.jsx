import React, { useState, useEffect, useRef, useCallback } from 'react';

const TypingAttack = () => {
  const canvasRef = useRef(null);
  const inputRef = useRef(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameActive, setGameActive] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  const words = ['CODE', 'TYPE', 'FAST', 'GAME', 'WORD', 'PLAY', 'ZONE', 'QUICK', 'ATTACK', 'DEFEND', 'REACT', 'SMART', 'PIXEL', 'SPACE', 'LEVEL'];
  const enemiesRef = useRef([]);
  const frameRef = useRef(0);
  const animationRef = useRef(null);

  const startGame = () => {
    enemiesRef.current = [];
    setScore(0);
    setLives(3);
    setGameActive(true);
    setInputValue('');
    frameRef.current = 0;
    if (inputRef.current) inputRef.current.focus();
  };

  const gameLoop = useCallback(() => {
    if (!gameActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    frameRef.current++;
    
    // Clear canvas
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Spawn enemy
    if (frameRef.current % 60 === 0) {
      enemiesRef.current.push({
        word: words[Math.floor(Math.random() * words.length)],
        x: Math.random() * (canvas.width - 100) + 20,
        y: -20,
        speed: 1 + Math.random() * 0.5 + (score / 20)
      });
    }

    // Update and draw enemies
    const nextEnemies = [];
    enemiesRef.current.forEach((e) => {
      e.y += e.speed;
      
      if (e.y > canvas.height) {
        setLives(prev => {
          const nextLives = prev - 1;
          if (nextLives <= 0) {
            setGameActive(false);
          }
          return nextLives;
        });
      } else {
        nextEnemies.push(e);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        
        // Draw word with shadow
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.fillText(e.word, e.x, e.y);
        ctx.shadowBlur = 0;
      }
    });
    enemiesRef.current = nextEnemies;

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameActive, score]);

  useEffect(() => {
    if (gameActive) {
      animationRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [gameActive, gameLoop]);

  const handleInputChange = (e) => {
    const val = e.target.value.toUpperCase();
    setInputValue(val);

    const index = enemiesRef.current.findIndex(en => en.word === val);
    if (index !== -1) {
      enemiesRef.current.splice(index, 1);
      setScore(prev => prev + 1);
      setInputValue('');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      color: '#fff'
    }}>
      <h2 style={{ marginBottom: '10px', color: '#e94560', fontSize: '2.5rem' }}>🔠 Typing Attack</h2>
      
      <div style={{
        display: 'flex',
        gap: '30px',
        marginBottom: '20px',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        background: 'rgba(255,255,255,0.1)',
        padding: '10px 30px',
        borderRadius: '50px'
      }}>
        <div>Score: <span style={{ color: '#e94560' }}>{score}</span></div>
        <div>Lives: <span style={{ color: lives <= 1 ? '#ff4d4d' : '#4dff4d' }}>{'❤️'.repeat(lives)}</span></div>
      </div>

      <div style={{
        position: 'relative',
        border: '4px solid #e94560',
        borderRadius: '15px',
        overflow: 'hidden',
        boxShadow: '0 0 30px rgba(233, 69, 96, 0.3)'
      }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
        />
        {!gameActive && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(15, 52, 96, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            zIndex: 10
          }}>
            {lives <= 0 ? (
              <>
                <h3 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Game Over!</h3>
                <p style={{ fontSize: '1.5rem', marginBottom: '30px' }}>Final Score: {score}</p>
              </>
            ) : (
              <h3 style={{ fontSize: '2rem', marginBottom: '30px' }}>Ready to defend?</h3>
            )}
            <button
              onClick={startGame}
              style={{
                padding: '15px 40px',
                fontSize: '1.2rem',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                background: '#e94560',
                color: '#fff',
                fontWeight: 'bold',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              {lives <= 0 ? 'Try Again' : 'Start Mission'}
            </button>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        disabled={!gameActive}
        placeholder={gameActive ? "Type the words..." : "Click Start to Play"}
        style={{
          width: 'min(400px, 90vw)',
          padding: '18px',
          fontSize: '1.5rem',
          border: '3px solid #e94560',
          borderRadius: '12px',
          textAlign: 'center',
          marginTop: '30px',
          background: '#0f3460',
          color: '#fff',
          outline: 'none',
          boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
        }}
      />
      
      <p style={{ marginTop: '20px', color: '#94a3b8' }}>
        Words will fall faster as your score increases!
      </p>
    </div>
  );
};

export default TypingAttack;
