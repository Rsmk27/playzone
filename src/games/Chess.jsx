import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

const Chess = () => {
  const pieces = { 
    'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟', 
    'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙' 
  };

  const initialBoard = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
  ];

  const [board, setBoard] = useState(initialBoard);
  const [selected, setSelected] = useState(null);
  const [turn, setTurn] = useState('white');

  const isValidMove = (sr, sc, dr, dc) => {
    const piece = board[sr][sc];
    const target = board[dr][dc];
    if (target) {
      const isTargetWhite = target === target.toUpperCase();
      const isPieceWhite = piece === piece.toUpperCase();
      if (isTargetWhite === isPieceWhite) return false;
    }

    const drAbs = Math.abs(dr - sr);
    const dcAbs = Math.abs(dc - sc);
    const pieceLower = piece.toLowerCase();

    // Basic move validation (simplified)
    switch (pieceLower) {
      case 'p':
        const dir = piece === 'P' ? -1 : 1;
        if (sc === dc && !target) {
          if (dr === sr + dir) return true;
          if ((piece === 'P' && sr === 6 || piece === 'p' && sr === 1) && dr === sr + 2 * dir && !board[sr + dir][sc]) return true;
        }
        if (dr === sr + dir && dcAbs === 1 && target) return true;
        return false;
      case 'r':
        if (sr !== dr && sc !== dc) return false;
        // Check path
        const rDir = dr > sr ? 1 : dr < sr ? -1 : 0;
        const cDir = dc > sc ? 1 : dc < sc ? -1 : 0;
        let currR = sr + rDir;
        let currC = sc + cDir;
        while (currR !== dr || currC !== dc) {
          if (board[currR][currC]) return false;
          currR += rDir;
          currC += cDir;
        }
        return true;
      case 'n':
        return (drAbs === 2 && dcAbs === 1) || (drAbs === 1 && dcAbs === 2);
      case 'b':
        if (drAbs !== dcAbs) return false;
        const rbDir = dr > sr ? 1 : -1;
        const cbDir = dc > sc ? 1 : -1;
        let cr = sr + rbDir;
        let cc = sc + cbDir;
        while (cr !== dr) {
          if (board[cr][cc]) return false;
          cr += rbDir;
          cc += cbDir;
        }
        return true;
      case 'q':
        if (sr !== dr && sc !== dc && drAbs !== dcAbs) return false;
        const rqDir = dr > sr ? 1 : dr < sr ? -1 : 0;
        const cqDir = dc > sc ? 1 : dc < sc ? -1 : 0;
        let curR = sr + rqDir;
        let curC = sc + cqDir;
        while (curR !== dr || curC !== dc) {
          if (board[curR][curC]) return false;
          curR += rqDir;
          curC += cqDir;
        }
        return true;
      case 'k':
        return drAbs <= 1 && dcAbs <= 1;
      default:
        return false;
    }
  };

  const handleClick = (r, c) => {
    if (selected) {
      const [sr, sc] = selected;
      if (isValidMove(sr, sc, r, c)) {
        const newBoard = board.map(row => [...row]);
        newBoard[r][c] = board[sr][sc];
        newBoard[sr][sc] = null;
        setBoard(newBoard);
        setTurn(turn === 'white' ? 'black' : 'white');
        setSelected(null);
      } else {
        const piece = board[r][c];
        if (piece) {
          const isWhite = piece === piece.toUpperCase();
          if ((turn === 'white' && isWhite) || (turn === 'black' && !isWhite)) {
            setSelected([r, c]);
          } else {
            setSelected(null);
          }
        } else {
          setSelected(null);
        }
      }
    } else {
      const piece = board[r][c];
      if (piece) {
        const isWhite = piece === piece.toUpperCase();
        if ((turn === 'white' && isWhite) || (turn === 'black' && !isWhite)) {
          setSelected([r, c]);
        }
      }
    }
  };

  const newGame = () => {
    setBoard(initialBoard);
    setTurn('white');
    setSelected(null);
  };

  return (
    <div className="page">
      <div className="game-header">
        <h1 className="game-title">♟️ Chess</h1>
        <div className="actions">
          <Link to="/" className="btn">← Back to Home</Link>
        </div>
      </div>

      <div className="info">{turn === 'white' ? "White's turn" : "Black's turn"}</div>

      <div className="canvas-wrap">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          width: '100%',
          maxWidth: '480px',
          aspectRatio: '1',
          border: '3px solid #333',
          background: '#fff'
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
                fontSize: '2rem',
                background: selected && selected[0] === r && selected[1] === c 
                  ? '#7fc97f' 
                  : (r + c) % 2 === 0 ? '#f0d9b5' : '#b58863'
              }}
            >
              {cell ? pieces[cell] : ''}
            </div>
          )))}
        </div>
      </div>

      <div className="game-controls">
        <button className="game-btn" onClick={newGame}>New Game</button>
      </div>

      <div className="small" style={{ marginTop: '20px', textAlign: 'center' }}>
        PlayZone · React Chess
      </div>
    </div>
  );
};

export default Chess;
