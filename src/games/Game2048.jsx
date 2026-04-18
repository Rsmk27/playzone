import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const Game2048 = () => {
  const [grid, setGrid] = useState(Array(4).fill().map(() => Array(4).fill(0)));
  const [score, setScore] = useState(0);

  const addRandom = useCallback((currentGrid) => {
    const empty = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (currentGrid[i][j] === 0) empty.push({ i, j });
      }
    }
    if (empty.length > 0) {
      const { i, j } = empty[Math.floor(Math.random() * empty.length)];
      const newGrid = [...currentGrid.map(row => [...row])];
      newGrid[i][j] = Math.random() < 0.9 ? 2 : 4;
      return newGrid;
    }
    return currentGrid;
  }, []);

  const initGame = useCallback(() => {
    let initialGrid = Array(4).fill().map(() => Array(4).fill(0));
    initialGrid = addRandom(initialGrid);
    initialGrid = addRandom(initialGrid);
    setGrid(initialGrid);
    setScore(0);
  }, [addRandom]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const move = useCallback((dir) => {
    setGrid(prevGrid => {
      let moved = false;
      let newScore = score;
      let nextGrid = prevGrid.map(row => [...row]);

      if (dir === 'left' || dir === 'right') {
        for (let i = 0; i < 4; i++) {
          let row = nextGrid[i].filter(x => x !== 0);
          if (dir === 'right') row.reverse();

          for (let j = 0; j < row.length - 1; j++) {
            if (row[j] === row[j + 1]) {
              row[j] *= 2;
              newScore += row[j];
              row.splice(j + 1, 1);
            }
          }

          while (row.length < 4) row.push(0);
          if (dir === 'right') row.reverse();
          
          if (JSON.stringify(nextGrid[i]) !== JSON.stringify(row)) moved = true;
          nextGrid[i] = row;
        }
      } else {
        for (let j = 0; j < 4; j++) {
          let col = [];
          for (let i = 0; i < 4; i++) {
            if (nextGrid[i][j] !== 0) col.push(nextGrid[i][j]);
          }
          if (dir === 'down') col.reverse();

          for (let i = 0; i < col.length - 1; i++) {
            if (col[i] === col[i + 1]) {
              col[i] *= 2;
              newScore += col[i];
              col.splice(i + 1, 1);
            }
          }

          while (col.length < 4) col.push(0);
          if (dir === 'down') col.reverse();
          
          for (let i = 0; i < 4; i++) {
            if (nextGrid[i][j] !== col[i]) moved = true;
            nextGrid[i][j] = col[i];
          }
        }
      }

      if (moved) {
        setScore(newScore);
        return addRandom(nextGrid);
      }
      return prevGrid;
    });
  }, [addRandom, score]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') move('left');
      if (e.key === 'ArrowRight') move('right');
      if (e.key === 'ArrowUp') move('up');
      if (e.key === 'ArrowDown') move('down');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const getCellColor = (val) => {
    const colors = {
      2: '#eee4da',
      4: '#ede0c8',
      8: '#f2b179',
      16: '#f59563',
      32: '#f67c5f',
      64: '#f65e3b',
      128: '#edcf72',
      256: '#edcc61',
      512: '#edc53f',
      1024: '#edc53f',
      2048: '#edc22e',
    };
    return colors[val] || '#cdc1b4';
  };

  const getTextColor = (val) => {
    return val <= 4 ? '#776e65' : '#f9f6f2';
  };

  return (
    <div className="page">
      <div className="game-header">
        <h1 className="game-title">🟨 2048</h1>
        <div className="actions">
          <div className="score-box" style={{ background: '#bbada0', padding: '5px 15px', borderRadius: '5px', color: 'white' }}>
            <span style={{ fontSize: '12px', display: 'block' }}>SCORE</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{score}</span>
          </div>
          <Link to="/" className="btn">← Back to Home</Link>
        </div>
      </div>

      <div className="info">Use arrow keys to play</div>

      <div className="canvas-wrap">
        <div style={{
          background: '#bbada0',
          borderRadius: '10px',
          padding: '10px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
          width: '100%',
          maxWidth: '400px',
          aspectRatio: '1'
        }}>
          {grid.map((row, i) => row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              style={{
                background: getCellColor(cell),
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: cell >= 1024 ? '1.5rem' : cell >= 128 ? '1.8rem' : '2rem',
                fontWeight: 'bold',
                color: getTextColor(cell),
                transition: 'all 0.1s ease-in-out'
              }}
            >
              {cell > 0 ? cell : ''}
            </div>
          )))}
        </div>
      </div>

      <div className="game-controls">
        <button className="game-btn" onClick={initGame}>New Game</button>
      </div>

      <div className="small" style={{ marginTop: '20px', textAlign: 'center' }}>
        PlayZone · React 2048
      </div>
    </div>
  );
};

export default Game2048;
