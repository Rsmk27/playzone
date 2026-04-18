import React, { useState, useEffect, useCallback } from 'react';

const Ludo = () => {
  const players = ['red', 'green', 'yellow', 'blue'];
  const colors = { red: '#e74c3c', green: '#27ae60', yellow: '#f39c12', blue: '#3498db' };
  
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [diceValue, setDiceValue] = useState(0);
  const [canRoll, setCanRoll] = useState(true);
  const [tokens, setTokens] = useState([]);
  const [message, setMessage] = useState('Roll the dice!');
  const [gameOver, setGameOver] = useState(false);

  // Main path coordinates (52 steps)
  const mainPath = [
    [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0],
    [7, 0], [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5],
    [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6],
    [14, 7], [14, 8], [13, 8], [12, 8], [11, 8], [10, 8], [9, 8],
    [8, 9], [8, 10], [8, 11], [8, 12], [8, 13], [8, 14],
    [7, 14], [6, 14], [6, 13], [6, 12], [6, 11], [6, 10], [6, 9],
    [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8], [0, 7], [0, 6]
  ];

  const homePaths = {
    red: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]],
    green: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]],
    yellow: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]],
    blue: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]]
  };

  const initGame = useCallback(() => {
    const initialTokens = [];
    players.forEach(p => {
      for (let i = 0; i < 4; i++) {
        initialTokens.push({ id: `${p}-${i}`, player: p, pos: -1, state: 'home' });
      }
    });
    setTokens(initialTokens);
    setCurrentPlayer(0);
    setDiceValue(0);
    setCanRoll(true);
    setMessage('Roll the dice!');
    setGameOver(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const getCoordinates = (token) => {
    if (token.state === 'home') return null;
    const pIndex = players.indexOf(token.player);
    const startOffset = pIndex * 13;
    if (token.pos <= 50) {
      const globalIdx = (startOffset + token.pos) % 52;
      return mainPath[globalIdx];
    } else {
      const homeIdx = token.pos - 51;
      return homePaths[token.player][homeIdx] || [7, 7];
    }
  };

  const isValidMove = (token, roll) => {
    if (token.state === 'home') return roll === 6;
    if (token.state === 'win') return false;
    if (token.pos + roll > 56) return false;
    return true;
  };

  const nextTurn = () => {
    setCurrentPlayer(prev => (prev + 1) % 4);
    setDiceValue(0);
    setCanRoll(true);
    setMessage('Roll the dice!');
  };

  const rollDice = () => {
    if (!canRoll || gameOver) return;
    const val = Math.floor(Math.random() * 6) + 1;
    setDiceValue(val);
    setCanRoll(false);

    const myTokens = tokens.filter(t => t.player === players[currentPlayer]);
    const hasValidMove = myTokens.some(t => isValidMove(t, val));

    if (!hasValidMove) {
      setMessage(`No valid moves for ${players[currentPlayer]}!`);
      setTimeout(nextTurn, 1500);
    } else {
      setMessage(`Move a ${players[currentPlayer]} token`);
    }
  };

  const handleTokenClick = (token) => {
    if (gameOver || canRoll || token.player !== players[currentPlayer] || diceValue === 0) return;
    if (!isValidMove(token, diceValue)) return;

    const newTokens = [...tokens];
    const targetToken = newTokens.find(t => t.id === token.id);

    if (targetToken.state === 'home') {
      targetToken.state = 'active';
      targetToken.pos = 0;
    } else {
      targetToken.pos += diceValue;
    }

    if (targetToken.pos === 56) {
      targetToken.state = 'win';
      setMessage('Token reached home!');
    } else if (targetToken.state === 'active' && targetToken.pos <= 50) {
      // Check capture
      const coords = getCoordinates(targetToken);
      const pIndex = players.indexOf(targetToken.player);
      const globalIdx = (pIndex * 13 + targetToken.pos) % 52;
      const isSafe = [0, 8, 13, 21, 26, 34, 39, 47].includes(globalIdx);

      if (!isSafe) {
        newTokens.forEach(ot => {
          if (ot.player !== targetToken.player && ot.state === 'active' && ot.pos <= 50) {
            const opCoords = getCoordinates(ot);
            if (opCoords && opCoords[0] === coords[0] && opCoords[1] === coords[1]) {
              ot.state = 'home';
              ot.pos = -1;
              setMessage(`Captured ${ot.player}!`);
            }
          }
        });
      }
    }

    setTokens(newTokens);

    if (newTokens.filter(t => t.player === token.player && t.state === 'win').length === 4) {
      setGameOver(true);
      setMessage(`${token.player.toUpperCase()} WINS!`);
      return;
    }

    if (diceValue !== 6) {
      nextTurn();
    } else {
      setMessage('Rolled a 6! Roll again.');
      setCanRoll(true);
      setDiceValue(0);
    }
  };

  const renderCell = (x, y) => {
    let className = 'ludo-cell';
    let style = {
      width: '100%',
      height: '100%',
      border: '1px solid #ddd',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff'
    };

    // Home areas
    if (x < 6 && y < 6) return null;
    if (x > 8 && y < 6) return null;
    if (x < 6 && y > 8) return null;
    if (x > 8 && y > 8) return null;

    // Center
    if (x >= 6 && x <= 8 && y >= 6 && y <= 8) {
      if (x === 6 && y === 6) {
        return (
          <div key="center" style={{
            gridRow: '7 / span 3',
            gridColumn: '7 / span 3',
            background: `conic-gradient(${colors.red} 0deg 90deg, ${colors.green} 90deg 180deg, ${colors.yellow} 180deg 270deg, ${colors.blue} 270deg 360deg)`,
            display: 'flex',
            flexWrap: 'wrap',
            alignContent: 'center',
            justifyContent: 'center',
            padding: '2px'
          }}>
            {tokens.filter(t => t.state === 'win').map(t => (
              <div key={t.id} style={{
                width: '15px',
                height: '15px',
                borderRadius: '50%',
                background: colors[t.player],
                margin: '1px',
                border: '1px solid #fff'
              }} />
            ))}
          </div>
        );
      }
      return null;
    }

    // Colored paths
    if (y === 7 && x > 0 && x < 6) style.background = colors.red;
    if (x === 7 && y > 0 && y < 6) style.background = colors.green;
    if (y === 7 && x > 8 && x < 14) style.background = colors.yellow;
    if (x === 7 && y > 8 && y < 14) style.background = colors.blue;

    // Start spots
    if (x === 1 && y === 6) style.background = colors.red;
    if (x === 8 && y === 1) style.background = colors.green;
    if (x === 13 && y === 8) style.background = colors.yellow;
    if (x === 6 && y === 13) style.background = colors.blue;

    const cellTokens = tokens.filter(t => {
      const coords = getCoordinates(t);
      return coords && coords[0] === x && coords[1] === y;
    });

    return (
      <div key={`${x}-${y}`} style={style}>
        {cellTokens.map((t, i) => (
          <div
            key={t.id}
            onClick={() => handleTokenClick(t)}
            style={{
              width: '80%',
              height: '80%',
              borderRadius: '50%',
              background: colors[t.player],
              position: 'absolute',
              zIndex: 10,
              cursor: t.player === players[currentPlayer] && !canRoll ? 'pointer' : 'default',
              border: '2px solid rgba(0,0,0,0.3)',
              transform: cellTokens.length > 1 ? `translate(${i * 3}px, ${i * 3}px) scale(0.8)` : 'none',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          />
        ))}
      </div>
    );
  };

  const renderHomeArea = (color, x, y) => {
    const areaTokens = tokens.filter(t => t.player === color && t.state === 'home');
    return (
      <div key={`${color}-home`} style={{
        gridColumn: `${x + 1} / span 6`,
        gridRow: `${y + 1} / span 6`,
        background: colors[color],
        border: '2px solid #333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '70%',
          height: '70%',
          background: '#fff',
          borderRadius: '15%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          padding: '10px',
          gap: '10px'
        }}>
          {[0, 1, 2, 3].map(i => {
            const t = tokens.find(tk => tk.id === `${color}-${i}`);
            return (
              <div key={i} style={{
                borderRadius: '50%',
                border: '1px solid #ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {t && t.state === 'home' && (
                  <div
                    onClick={() => handleTokenClick(t)}
                    style={{
                      width: '80%',
                      height: '80%',
                      borderRadius: '50%',
                      background: colors[color],
                      cursor: color === players[currentPlayer] && !canRoll ? 'pointer' : 'default',
                      border: '2px solid rgba(0,0,0,0.3)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const diceIcons = ['🎲', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      color: '#fff',
      maxWidth: '1000px',
      margin: '0 auto'
    }}>
      <h2 style={{ marginBottom: '20px' }}>🎲 Ludo</h2>

      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '10px 20px',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>Current Turn:</span>
          <span style={{
            padding: '5px 15px',
            borderRadius: '20px',
            background: colors[players[currentPlayer]],
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}>
            {players[currentPlayer]}
          </span>
        </div>
        <div style={{ fontWeight: 'bold', color: '#ffd700' }}>{message}</div>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '40px',
        justifyContent: 'center',
        alignItems: 'start'
      }}>
        <div style={{
          width: 'min(90vw, 500px)',
          height: 'min(90vw, 500px)',
          background: '#fff',
          border: '2px solid #333',
          display: 'grid',
          gridTemplateColumns: 'repeat(15, 1fr)',
          gridTemplateRows: 'repeat(15, 1fr)'
        }}>
          {renderHomeArea('red', 0, 0)}
          {renderHomeArea('green', 9, 0)}
          {renderHomeArea('blue', 0, 9)}
          {renderHomeArea('yellow', 9, 9)}
          {Array.from({ length: 15 }).map((_, y) => 
            Array.from({ length: 15 }).map((_, x) => renderCell(x, y))
          )}
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div 
            onClick={rollDice}
            style={{
              width: '80px',
              height: '80px',
              background: '#fff',
              color: '#333',
              borderRadius: '15px',
              fontSize: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: canRoll ? 'pointer' : 'default',
              boxShadow: canRoll ? '0 6px 0 #ccc' : '0 2px 0 #ccc',
              transform: canRoll ? 'none' : 'translateY(4px)',
              transition: 'all 0.1s',
              userSelect: 'none'
            }}
          >
            {diceIcons[diceValue]}
          </div>
          <p style={{ color: '#aaa', fontSize: '0.9rem' }}>{canRoll ? 'Click to roll' : 'Move a token'}</p>
          
          <button
            onClick={initGame}
            style={{
              padding: '10px 20px',
              background: '#6b7280',
              border: 'none',
              borderRadius: '5px',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Reset Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default Ludo;
