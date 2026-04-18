import React, { useState, useEffect, useCallback } from 'react';

const WordSearch = () => {
  const WORDS = ['CAT', 'DOG', 'BIRD', 'FISH', 'CODE', 'GAME', 'PLAY', 'ZONE', 'WORD', 'FIND'];
  const [grid, setGrid] = useState([]);
  const [found, setFound] = useState(new Set());
  const [selecting, setSelecting] = useState(false);
  const [selectedCells, setSelectedCells] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [wordPositions, setWordPositions] = useState({});

  const canPlace = (w, r, c, d, currentGrid) => {
    const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
    const [dr, dc] = dirs[d];
    for (let i = 0; i < w.length; i++) {
      const nr = r + i * dr, nc = c + i * dc;
      if (nr < 0 || nr >= 10 || nc < 0 || nc >= 10) return false;
      if (currentGrid[nr][nc] && currentGrid[nr][nc] !== w[i]) return false;
    }
    return true;
  };

  const newGame = useCallback(() => {
    const newGrid = Array(10).fill().map(() => Array(10).fill(''));
    const newWordPositions = {};
    const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];

    WORDS.forEach(w => {
      let placed = false;
      while (!placed) {
        const d = Math.floor(Math.random() * dirs.length);
        const r = Math.floor(Math.random() * 10);
        const c = Math.floor(Math.random() * 10);
        if (canPlace(w, r, c, d, newGrid)) {
          const [dr, dc] = dirs[d];
          const positions = [];
          for (let i = 0; i < w.length; i++) {
            newGrid[r + i * dr][c + i * dc] = w[i];
            positions.push(`${r + i * dr}-${c + i * dc}`);
          }
          newWordPositions[w] = positions;
          placed = true;
        }
      }
    });

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (!newGrid[i][j]) {
          newGrid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }

    setGrid(newGrid);
    setWordPositions(newWordPositions);
    setFound(new Set());
    setStartTime(Date.now());
    setElapsed(0);
  }, []);

  useEffect(() => {
    newGame();
  }, [newGame]);

  useEffect(() => {
    let interval;
    if (startTime && found.size < WORDS.length) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, found.size]);

  const startSelection = (r, c) => {
    setSelecting(true);
    setSelectedCells([`${r}-${c}`]);
  };

  const continueSelection = (r, c) => {
    if (selecting) {
      const cell = `${r}-${c}`;
      if (!selectedCells.includes(cell)) {
        setSelectedCells(prev => [...prev, cell]);
      }
    }
  };

  const endSelection = () => {
    if (!selecting) return;
    setSelecting(false);
    
    // Check if selected cells form a word
    const selectedWord = selectedCells.map(pos => {
      const [r, c] = pos.split('-').map(Number);
      return grid[r][c];
    }).join('');

    const reversedWord = selectedWord.split('').reverse().join('');

    let foundWord = null;
    WORDS.forEach(w => {
      if ((w === selectedWord || w === reversedWord) && !found.has(w)) {
        // Verify positions match exactly
        const positions = wordPositions[w];
        const isMatch = selectedCells.every(cell => positions.includes(cell)) && 
                       selectedCells.length === positions.length;
        if (isMatch) foundWord = w;
      }
    });

    if (foundWord) {
      setFound(prev => {
        const next = new Set(prev);
        next.add(foundWord);
        return next;
      });
    }
    setSelectedCells([]);
  };

  const isCellSelected = (r, c) => selectedCells.includes(`${r}-${c}`);
  const isCellFound = (r, c) => {
    const pos = `${r}-${c}`;
    return Array.from(found).some(w => wordPositions[w].includes(pos));
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      color: '#333',
      background: '#f0f4f8',
      borderRadius: '20px',
      maxWidth: '600px',
      margin: '0 auto',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginBottom: '10px', color: '#667eea', fontSize: '2.5rem' }}>✏️ Word Search</h2>
      
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '20px',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: '#555'
      }}>
        <span>Time: {elapsed}s</span>
        <span>|</span>
        <span>Found: {found.size}/{WORDS.length}</span>
      </div>

      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(10, min(40px, 8vw))',
          gap: '4px',
          background: '#cbd5e0',
          padding: '8px',
          borderRadius: '10px',
          userSelect: 'none',
          cursor: 'pointer'
        }}
        onMouseLeave={endSelection}
      >
        {grid.map((row, r) => (
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              onMouseDown={() => startSelection(r, c)}
              onMouseEnter={() => continueSelection(r, c)}
              onMouseUp={endSelection}
              style={{
                width: 'min(400px, 8vw)',
                height: 'min(400px, 8vw)',
                background: isCellSelected(r, c) ? '#fbbf24' : isCellFound(r, c) ? '#10b981' : '#fff',
                color: (isCellSelected(r, c) || isCellFound(r, c)) ? '#fff' : '#333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                borderRadius: '4px',
                transition: 'all 0.1s',
                fontSize: '1.1rem'
              }}
            >
              {cell}
            </div>
          ))
        ))}
      </div>

      <div style={{
        marginTop: '25px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '10px'
      }}>
        {WORDS.map(w => (
          <div
            key={w}
            style={{
              padding: '8px 15px',
              background: found.has(w) ? '#10b981' : '#fff',
              color: found.has(w) ? '#fff' : '#666',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              textDecoration: found.has(w) ? 'line-through' : 'none',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              transition: 'all 0.3s'
            }}
          >
            {w}
          </div>
        ))}
      </div>

      <button
        onClick={newGame}
        style={{
          marginTop: '30px',
          width: '100%',
          padding: '15px',
          fontSize: '1.1rem',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          background: '#667eea',
          color: '#fff',
          fontWeight: 'bold',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.background = '#5a67d8'}
        onMouseLeave={(e) => e.target.style.background = '#667eea'}
      >
        New Game
      </button>
    </div>
  );
};

export default WordSearch;
