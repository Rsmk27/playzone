import React, { useState, useEffect, useRef, useCallback } from 'react';

const Maze = () => {
  const canvasRef = useRef(null);
  const [size] = useState(25);
  const [cell] = useState(20);
  const [maze, setMaze] = useState([]);
  const [player, setPlayer] = useState({ x: 0, y: 0 });
  const [gameWon, setGameWon] = useState(false);

  const generateMaze = useCallback(() => {
    const newMaze = Array(size).fill().map(() => Array(size).fill(1));
    const stack = [{ x: 0, y: 0 }];
    newMaze[0][0] = 0;

    while (stack.length) {
      const current = stack[stack.length - 1];
      const neighbors = [];
      const dirs = [[0, -2], [0, 2], [-2, 0], [2, 0]];

      dirs.forEach(([dx, dy]) => {
        const nx = current.x + dx, ny = current.y + dy;
        if (nx >= 0 && nx < size && ny >= 0 && ny < size && newMaze[ny][nx] === 1) {
          neighbors.push({ x: nx, y: ny, wx: current.x + dx / 2, wy: current.y + dy / 2 });
        }
      });

      if (neighbors.length) {
        const n = neighbors[Math.floor(Math.random() * neighbors.length)];
        newMaze[n.wy][n.wx] = 0;
        newMaze[n.y][n.x] = 0;
        stack.push({ x: n.x, y: n.y });
      } else {
        stack.pop();
      }
    }
    newMaze[size - 1][size - 1] = 0;
    setMaze(newMaze);
    setPlayer({ x: 0, y: 0 });
    setGameWon(false);
  }, [size]);

  useEffect(() => {
    generateMaze();
  }, [generateMaze]);

  const drawMaze = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || maze.length === 0) return;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (maze[y][x] === 1) {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x * cell, y * cell, cell, cell);
        }
      }
    }

    // Goal
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect((size - 1) * cell, (size - 1) * cell, cell, cell);

    // Player
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(player.x * cell + cell / 2, player.y * cell + cell / 2, cell / 3, 0, Math.PI * 2);
    ctx.fill();
  }, [maze, player, size, cell]);

  useEffect(() => {
    drawMaze();
  }, [drawMaze]);

  const movePlayer = useCallback((dx, dy) => {
    if (gameWon) return;
    setPlayer(prev => {
      const nx = prev.x + dx;
      const ny = prev.y + dy;
      if (nx >= 0 && nx < size && ny >= 0 && ny < size && maze[ny][nx] === 0) {
        if (nx === size - 1 && ny === size - 1) {
          setGameWon(true);
        }
        return { x: nx, y: ny };
      }
      return prev;
    });
  }, [maze, size, gameWon]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const moves = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0]
      };
      if (moves[e.key]) {
        e.preventDefault();
        movePlayer(...moves[e.key]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      color: '#fff'
    }}>
      <h2 style={{ marginBottom: '10px', fontSize: '2.5rem' }}>🌀 Maze Generator</h2>
      <p style={{ marginBottom: '20px', color: '#94a3b8' }}>Use arrow keys to reach the yellow exit</p>

      <div style={{
        position: 'relative',
        padding: '10px',
        background: '#334155',
        borderRadius: '15px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}>
        <canvas
          ref={canvasRef}
          width={size * cell}
          height={size * cell}
          style={{
            display: 'block',
            borderRadius: '5px'
          }}
        />
        {gameWon && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(16, 185, 129, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '15px',
            color: '#fff',
            fontSize: '2rem',
            fontWeight: 'bold',
            zIndex: 10
          }}>
            🎉 Escaped!
            <button
              onClick={generateMaze}
              style={{
                marginTop: '20px',
                padding: '12px 30px',
                fontSize: '1rem',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                background: '#fff',
                color: '#10b981',
                fontWeight: 'bold'
              }}
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 60px)', gap: '10px' }}>
          <div />
          <button onClick={() => movePlayer(0, -1)} style={controlStyle}>↑</button>
          <div />
          <button onClick={() => movePlayer(-1, 0)} style={controlStyle}>←</button>
          <button onClick={() => movePlayer(0, 1)} style={controlStyle}>↓</button>
          <button onClick={() => movePlayer(1, 0)} style={controlStyle}>→</button>
        </div>
      </div>

      <button
        onClick={generateMaze}
        style={{
          marginTop: '30px',
          padding: '12px 40px',
          fontSize: '1.1rem',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          background: '#ff6b9d',
          color: '#fff',
          fontWeight: 'bold',
          transition: 'all 0.2s'
        }}
      >
        New Maze
      </button>
    </div>
  );
};

const controlStyle = {
  width: '60px',
  height: '60px',
  fontSize: '24px',
  border: 'none',
  borderRadius: '12px',
  background: '#475569',
  color: '#fff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

export default Maze;
