import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const PhysicsBalls = () => {
  const canvasRef = useRef(null);
  const [balls, setBalls] = useState([]);
  const ballsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const animate = () => {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const currentBalls = ballsRef.current;

      currentBalls.forEach((b, i) => {
        b.vy += 0.5;
        b.x += b.vx;
        b.y += b.vy;

        if (b.x - b.r < 0 || b.x + b.r > canvas.width) {
          b.vx *= -0.9;
          b.x = b.x < canvas.width / 2 ? b.r : canvas.width - b.r;
        }

        if (b.y + b.r > canvas.height) {
          b.y = canvas.height - b.r;
          b.vy *= -0.9;
          if (Math.abs(b.vy) < 0.5) b.vy = 0;
        }

        b.vx *= 0.99;

        for (let j = i + 1; j < currentBalls.length; j++) {
          const b2 = currentBalls[j];
          const dx = b2.x - b.x;
          const dy = b2.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < b.r + b2.r) {
            const angle = Math.atan2(dy, dx);
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);

            const vx1 = b.vx * cos + b.vy * sin;
            const vy1 = b.vy * cos - b.vx * sin;
            const vx2 = b2.vx * cos + b2.vy * sin;
            const vy2 = b2.vy * cos - b2.vx * sin;

            b.vx = vx2 * cos - vy1 * sin;
            b.vy = vy1 * cos + vx2 * sin;
            b2.vx = vx1 * cos - vy2 * sin;
            b2.vy = vy2 * cos + vx1 * sin;

            const overlap = (b.r + b2.r - dist) / 2;
            b.x -= overlap * cos;
            b.y -= overlap * sin;
            b2.x += overlap * cos;
            b2.y += overlap * sin;
          }
        }

        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const colors = ['#e74c3c', '#3498db', '#f39c12', '#27ae60', '#9b59b6', '#1abc9c'];
    
    // Calculate scale in case canvas is resized via CSS
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const newBall = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      vx: (Math.random() - 0.5) * 10,
      vy: Math.random() * -5,
      r: 10 + Math.random() * 20,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    
    ballsRef.current = [...ballsRef.current, newBall];
    setBalls([...ballsRef.current]);
  };

  const clearBalls = () => {
    ballsRef.current = [];
    setBalls([]);
  };

  return (
    <div className="page">
      <div className="game-header">
        <h1 className="game-title">⚖️ Physics Sandbox</h1>
        <div className="actions">
          <Link to="/" className="btn">← Back to Home</Link>
        </div>
      </div>

      <div className="info">Click to create balls</div>

      <div className="canvas-wrap">
        <canvas
          ref={canvasRef}
          width="600"
          height="400"
          onClick={handleClick}
          style={{
            border: '3px solid #fff',
            background: '#1a1a2e',
            display: 'block',
            maxWidth: '100%',
            height: 'auto',
            cursor: 'crosshair'
          }}
        />
      </div>

      <div className="game-controls">
        <button className="game-btn" onClick={clearBalls}>Clear All</button>
      </div>

      <div className="small" style={{ marginTop: '20px', textAlign: 'center' }}>
        PlayZone · React Physics Game
      </div>
    </div>
  );
};

export default PhysicsBalls;
