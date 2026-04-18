import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const Checkers = () => {
  const [board, setBoard] = useState(Array(8).fill().map(() => Array(8).fill(null)));
  const [selected, setSelected] = useState(null);
  const [turn, setTurn] = useState('red');
  const [mustJump, setMustJump] = useState(false);
  const [validMoves, setValidMoves] = useState([]);

  const initGame = useCallback(() => {
    const newBoard = Array(8).fill().map(() => Array(8).fill(null));
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1) newBoard[r][c] = { color: 'black', king: false };
      }
    }
    for (let r = 5; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1) newBoard[r][c] = { color: 'red', king: false };
      }
    }
    setBoard(newBoard);
    setTurn('red');
    setSelected(null);
    setValidMoves([]);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const getMoves = useCallback((r, c, currentBoard = board) => {
    const piece = currentBoard[r][c];
    if (!piece) return [];
    const moves = [];
    const dirs = piece.king ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] : (piece.color === 'red' ? [[-1, 1], [-1, -1]] : [[1, 1], [1, -1]]);

    dirs.forEach(([dr, dc]) => {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && !currentBoard[nr][nc]) {
        moves.push({ r: nr, c: nc, jump: false });
      }
      const jr = r + 2 * dr, jc = c + 2 * dc;
      if (jr >= 0 && jr < 8 && jc >= 0 && jc < 8 && !currentBoard[jr][jc] && currentBoard[nr][nc] && currentBoard[nr][nc].color !== piece.color) {
        moves.push({ r: jr, c: jc, jump: true });
      }
    });
    return moves;
  }, [board]);

  const getJumps = useCallback((r, c, currentBoard = board) => {
    return getMoves(r, c, currentBoard).filter(m => m.jump);
  }, [getMoves, board]);

  useEffect(() => {
    let hasJump = false;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c] && board[r][c].color === turn) {
          if (getJumps(r, c).length > 0) {
            hasJump = true;
            break;
          }
        }
      }
      if (hasJump) break;
    }
    setMustJump(hasJump);
  }, [board, turn, getJumps]);

  const handleClick = (r, c) => {
    if (selected) {
      const [sr, sc] = selected;
      const move = validMoves.find(m => m.r === r && m.c === c);
      if (move) {
        const newBoard = board.map(row => [...row]);
        newBoard[r][c] = board[sr][sc];
        newBoard[sr][sc] = null;
        if (move.jump) {
          const mr = (sr + r) / 2, mc = (sc + c) / 2;
          newBoard[mr][mc] = null;
        }
        if ((turn === 'red' && r === 0) || (turn === 'black' && r === 7)) {
          newBoard[r][c].king = true;
        }

        if (move.jump) {
          const nextJumps = getJumps(r, c, newBoard);
          if (nextJumps.length > 0) {
            setBoard(newBoard);
            setSelected([r, c]);
            setValidMoves(nextJumps);
            return;
          }
        }

        setBoard(newBoard);
        setTurn(turn === 'red' ? 'black' : 'red');
        setSelected(null);
        setValidMoves([]);
      } else {
        if (board[r][c] && board[r][c].color === turn) {
          const moves = getMoves(r, c);
          setSelected([r, c]);
          setValidMoves(mustJump ? moves.filter(m => m.jump) : moves);
        } else {
          setSelected(null);
          setValidMoves([]);
        }
      }
    } else {
      if (board[r][c] && board[r][c].color === turn) {
        const moves = getMoves(r, c);
        const filteredMoves = mustJump ? moves.filter(m => m.jump) : moves;
        if (filteredMoves.length > 0) {
          setSelected([r, c]);
          setValidMoves(filteredMoves);
        }
      }
    }
  };

  return (
    <div className="page">
      <div className="game-header">
        <h1 className="game-title">⬛⬜ Checkers</h1>
        <div className="actions">
          <Link to="/" className="btn">← Back to Home</Link>
        </div>
      </div>

      <div className="info" style={{ color: turn === 'red' ? '#e74c3c' : '#2c3e50', fontWeight: 'bold' }}>
        {turn === 'red' ? "Red's turn" : "Black's turn"} {mustJump && "(Must jump!)"}
      </div>

      <div className="canvas-wrap">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          width: '100%',
          maxWidth: '480px',
          aspectRatio: '1',
          border: '3px solid #333'
        }}>
          {board.map((row, r) => row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              onClick={() => handleClick(r, c)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                background: (r + c) % 2 === 0 ? '#f0d9b5' : '#b58863',
                boxShadow: selected && selected[0] === r && selected[1] === c ? 'inset 0 0 0 3px #fbbf24' : 'none'
              }}
            >
              {validMoves.some(m => m.r === r && m.c === c) && (
                <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'rgba(34, 197, 94, 0.3)' }} />
              )}
              {cell && (
                <div style={{
                  width: '80%',
                  height: '80%',
                  borderRadius: '50%',
                  background: cell.color === 'red' ? '#e74c3c' : '#2c3e50',
                  border: `2px solid ${cell.color === 'red' ? '#c0392b' : '#1a252f'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  color: 'white',
                  zIndex: 1
                }}>
                  {cell.king && '👑'}
                </div>
              )}
            </div>
          )))}
        </div>
      </div>

      <div className="game-controls">
        <button className="game-btn" onClick={initGame}>New Game</button>
      </div>

      <div className="small" style={{ marginTop: '20px', textAlign: 'center' }}>
        PlayZone · React Checkers
      </div>
    </div>
  );
};

export default Checkers;
