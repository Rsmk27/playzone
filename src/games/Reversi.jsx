import React, { useState, useEffect } from 'react';

const Reversi = () => {
  const [board, setBoard] = useState(Array(8).fill().map(() => Array(8).fill(null)));
  const [turn, setTurn] = useState('black');
  const [scores, setScores] = useState({ black: 2, white: 2 });
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    newGame();
  }, []);

  const newGame = () => {
    const newBoard = Array(8).fill().map(() => Array(8).fill(null));
    newBoard[3][3] = 'white';
    newBoard[3][4] = 'black';
    newBoard[4][3] = 'black';
    newBoard[4][4] = 'white';
    setBoard(newBoard);
    setTurn('black');
    setScores({ black: 2, white: 2 });
    setGameOver(false);
  };

  const getFlips = (r, c, color, currentBoard) => {
    const dirs = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];
    const allFlips = [];
    dirs.forEach(([dr, dc]) => {
      const flips = [];
      let nr = r + dr, nc = c + dc;
      while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        if (!currentBoard[nr][nc]) break;
        if (currentBoard[nr][nc] === color) {
          allFlips.push(...flips);
          break;
        }
        flips.push([nr, nc]);
        nr += dr;
        nc += dc;
      }
    });
    return allFlips;
  };

  const hasValidMove = (color, currentBoard) => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (!currentBoard[r][c] && getFlips(r, c, color, currentBoard).length > 0) {
          return true;
        }
      }
    }
    return false;
  };

  const makeMove = (r, c) => {
    if (board[r][c] || gameOver) return;

    const flips = getFlips(r, c, turn, board);
    if (flips.length === 0) return;

    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = turn;
    flips.forEach(([fr, fc]) => {
      newBoard[fr][fc] = turn;
    });

    const nextTurn = turn === 'black' ? 'white' : 'black';
    
    // Update scores
    const newScores = { black: 0, white: 0 };
    newBoard.flat().forEach(p => {
      if (p) newScores[p]++;
    });

    setBoard(newBoard);
    setScores(newScores);

    if (hasValidMove(nextTurn, newBoard)) {
      setTurn(nextTurn);
    } else if (hasValidMove(turn, newBoard)) {
      // Current player gets another turn if opponent has no moves
      alert(`${nextTurn} has no moves! ${turn} goes again.`);
    } else {
      setGameOver(true);
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
      <h2 style={{ marginBottom: '20px', fontSize: '2rem' }}>⚫⚪ Reversi</h2>
      
      <div style={{
        fontSize: '1.3rem',
        marginBottom: '20px',
        padding: '10px 20px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '10px'
      }}>
        <span style={{ color: '#000', fontWeight: 'bold' }}>Black: {scores.black}</span>
        <span style={{ margin: '0 15px' }}>|</span>
        <span style={{ color: '#fff', fontWeight: 'bold', textShadow: '0 0 2px #000' }}>White: {scores.white}</span>
      </div>

      <div style={{
        marginBottom: '15px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: turn === 'black' ? '#000' : '#fff'
      }}>
        {gameOver ? 'Game Over!' : `Current Turn: ${turn.toUpperCase()}`}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, min(60px, 10vw))',
        gap: '2px',
        background: '#004d40',
        padding: '5px',
        borderRadius: '5px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        {board.map((row, r) => (
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              onClick={() => makeMove(r, c)}
              style={{
                width: 'min(60px, 10vw)',
                height: 'min(60px, 10vw)',
                background: cell === null ? '#0a6' : '#0a6',
                cursor: cell === null ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
            >
              {cell && (
                <div style={{
                  width: '80%',
                  height: '80%',
                  borderRadius: '50%',
                  background: cell === 'black' ? '#000' : '#fff',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  transition: 'transform 0.3s ease'
                }} />
              )}
            </div>
          ))
        ))}
      </div>

      {gameOver && (
        <div style={{
          marginTop: '20px',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#ffd700'
        }}>
          {scores.black > scores.white ? 'Black Wins!' : scores.white > scores.black ? 'White Wins!' : 'It\'s a Tie!'}
        </div>
      )}

      <button
        onClick={newGame}
        style={{
          marginTop: '30px',
          padding: '12px 30px',
          fontSize: '1.1rem',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          background: '#fff',
          color: '#004d40',
          fontWeight: 'bold',
          transition: 'all 0.2s'
        }}
      >
        New Game
      </button>
    </div>
  );
};

export default Reversi;
