import React, { useState, useEffect } from 'react';

const LightsOut = () => {
  const [grid, setGrid] = useState(Array(5).fill().map(() => Array(5).fill(false)));
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  const newGame = () => {
    const newGrid = Array(5).fill().map(() => Array(5).fill(false));
    setGrid(newGrid);
    setMoves(0);
    setGameWon(false);

    // Randomize by toggling random cells
    let tempGrid = newGrid.map(row => [...row]);
    for (let i = 0; i < 15; i++) {
      const r = Math.floor(Math.random() * 5);
      const c = Math.floor(Math.random() * 5);
      tempGrid = toggleCells(r, c, tempGrid);
    }
    setGrid(tempGrid);
  };

  useEffect(() => {
    newGame();
  }, []);

  const toggleCells = (r, c, currentGrid) => {
    const nextGrid = currentGrid.map(row => [...row]);
    const dirs = [[0, 0], [0, 1], [0, -1], [1, 0], [-1, 0]];
    dirs.forEach(([dr, dc]) => {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5) {
        nextGrid[nr][nc] = !nextGrid[nr][nc];
      }
    });
    return nextGrid;
  };

  const handleClick = (r, c) => {
    if (gameWon) return;
    const nextGrid = toggleCells(r, c, grid);
    setGrid(nextGrid);
    setMoves(prev => prev + 1);

    if (nextGrid.flat().every(cell => !cell)) {
      setGameWon(true);
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
      <h2 style={{ marginBottom: '20px', color: '#fbbf24', fontSize: '2.5rem' }}>💡 Lights Out</h2>
      
      <div style={{ fontSize: '1.5rem', marginBottom: '20px', fontWeight: 'bold' }}>
        Moves: <span style={{ color: '#fbbf24' }}>{moves}</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, min(80px, 15vw))',
        gap: '10px',
        padding: '15px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '15px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        {grid.map((row, r) => (
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              onClick={() => handleClick(r, c)}
              style={{
                width: 'min(80px, 15vw)',
                height: 'min(80px, 15vw)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: cell ? '#fbbf24' : '#333',
                boxShadow: cell ? '0 0 25px #fbbf24, inset 0 0 10px rgba(255,255,255,0.5)' : 'inset 0 0 10px rgba(0,0,0,0.5)',
                border: '2px solid rgba(255,255,255,0.1)'
              }}
              onMouseEnter={(e) => {
                if (!cell) e.target.style.background = '#444';
              }}
              onMouseLeave={(e) => {
                if (!cell) e.target.style.background = '#333';
              }}
            />
          ))
        ))}
      </div>

      {gameWon && (
        <div style={{
          marginTop: '25px',
          padding: '15px 30px',
          background: '#fbbf24',
          color: '#000',
          borderRadius: '10px',
          fontSize: '1.3rem',
          fontWeight: 'bold',
          animation: 'bounce 1s infinite'
        }}>
          🎉 You Won in {moves} moves!
        </div>
      )}

      <button
        onClick={newGame}
        style={{
          marginTop: '30px',
          padding: '15px 40px',
          fontSize: '1.1rem',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          background: '#fbbf24',
          color: '#000',
          fontWeight: 'bold',
          boxShadow: '0 4px 0 #b45309',
          transition: 'all 0.1s'
        }}
        onMouseDown={(e) => {
          e.target.style.transform = 'translateY(2px)';
          e.target.style.boxShadow = '0 2px 0 #b45309';
        }}
        onMouseUp={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 0 #b45309';
        }}
      >
        New Game
      </button>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default LightsOut;
