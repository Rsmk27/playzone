import React, { useState, useEffect } from 'react';

const TowerOfHanoi = () => {
  const [towers, setTowers] = useState([[], [], []]);
  const [selected, setSelected] = useState(null);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const DISK_COUNT = 3;

  const newGame = () => {
    setTowers([[3, 2, 1], [], []]);
    setSelected(null);
    setMoves(0);
    setGameWon(false);
  };

  useEffect(() => {
    newGame();
  }, []);

  const selectTower = (idx) => {
    if (gameWon) return;

    if (selected === null) {
      if (towers[idx].length > 0) {
        setSelected(idx);
      }
    } else {
      if (idx !== selected) {
        const disk = towers[selected][towers[selected].length - 1];
        const canMove = towers[idx].length === 0 || towers[idx][towers[idx].length - 1] > disk;
        
        if (canMove) {
          const newTowers = towers.map(t => [...t]);
          newTowers[idx].push(newTowers[selected].pop());
          setTowers(newTowers);
          setMoves(prev => prev + 1);
          
          if (newTowers[2].length === DISK_COUNT) {
            setGameWon(true);
          }
        }
      }
      setSelected(null);
    }
  };

  const colors = ['#3498db', '#f39c12', '#e74c3c'];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      color: '#333',
      background: '#fff',
      borderRadius: '20px',
      maxWidth: '600px',
      margin: '0 auto',
      boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginBottom: '10px', color: '#f5576c', fontSize: '2.5rem' }}>🗼 Tower of Hanoi</h2>
      
      <div style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: 'bold', color: '#666' }}>
        Moves: <span style={{ color: '#f5576c' }}>{moves}</span>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        width: '100%',
        height: '300px',
        margin: '20px 0',
        alignItems: 'flex-end',
        background: '#f8f9fa',
        borderRadius: '15px',
        padding: '20px',
        position: 'relative'
      }}>
        {towers.map((tower, tIdx) => (
          <div
            key={tIdx}
            onClick={() => selectTower(tIdx)}
            style={{
              width: '120px',
              height: '250px',
              position: 'relative',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column-reverse',
              alignItems: 'center',
              paddingBottom: '5px'
            }}
          >
            {/* The pole */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              width: '10px',
              height: '100%',
              background: '#dee2e6',
              borderRadius: '5px',
              zIndex: 0,
              border: selected === tIdx ? '2px solid #10b981' : 'none',
              boxShadow: selected === tIdx ? '0 0 10px #10b981' : 'none'
            }} />
            
            {/* The base */}
            <div style={{
              position: 'absolute',
              bottom: -5,
              width: '140px',
              height: '10px',
              background: '#adb5bd',
              borderRadius: '5px'
            }} />

            {tower.map((disk, dIdx) => (
              <div
                key={dIdx}
                style={{
                  width: `${disk * 40}px`,
                  height: '25px',
                  background: colors[disk - 1],
                  borderRadius: '5px',
                  marginBottom: '2px',
                  zIndex: 1,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {gameWon && (
        <div style={{
          marginTop: '20px',
          padding: '10px 30px',
          background: '#10b981',
          color: '#fff',
          borderRadius: '10px',
          fontWeight: 'bold',
          fontSize: '1.2rem'
        }}>
          🎉 Perfect! Solved in {moves} moves.
        </div>
      )}

      <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
        <button
          onClick={newGame}
          style={{
            padding: '12px 30px',
            fontSize: '1.1rem',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            background: '#f5576c',
            color: '#fff',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#e04659'}
          onMouseLeave={(e) => e.target.style.background = '#f5576c'}
        >
          Reset Game
        </button>
      </div>
      
      <p style={{ marginTop: '20px', color: '#999', fontSize: '0.9rem' }}>
        Goal: Move all disks to the rightmost tower. <br/>
        Rules: Only one disk can be moved at a time, and a larger disk cannot be placed on top of a smaller one.
      </p>
    </div>
  );
};

export default TowerOfHanoi;
