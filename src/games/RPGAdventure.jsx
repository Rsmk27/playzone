import React, { useState, useEffect } from 'react';

const RPGAdventure = () => {
  const [hp, setHp] = useState(100);
  const [gold, setGold] = useState(0);
  const [level, setLevel] = useState(1);
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const scenarios = [
    {
      text: "You enter a dark forest. You see a path split in two directions.",
      choices: [
        { text: "Take the left path", action: () => { setHp(prev => prev - 10); setScenarioIdx(1); } },
        { text: "Take the right path", action: () => { setGold(prev => prev + 10); setScenarioIdx(2); } }
      ]
    },
    {
      text: "A wolf appears! It looks hungry.",
      choices: [
        { text: "Fight the wolf", action: () => { setHp(prev => prev - 20); setGold(prev => prev + 20); setLevel(prev => prev + 1); setScenarioIdx(3); } },
        { text: "Run away", action: () => { setHp(prev => prev - 5); setScenarioIdx(0); } }
      ]
    },
    {
      text: "You find a treasure chest!",
      choices: [
        { text: "Open it", action: () => { setGold(prev => prev + 50); setLevel(prev => prev + 1); setScenarioIdx(4); } },
        { text: "Leave it", action: () => setScenarioIdx(0) }
      ]
    },
    {
      text: "Victory! The wolf is defeated.",
      choices: [
        { text: "Continue adventure", action: () => setScenarioIdx(Math.floor(Math.random() * scenarios.length)) }
      ]
    },
    {
      text: "The chest contains gold and a healing potion! You feel stronger.",
      choices: [
        { text: "Continue adventure", action: () => { setHp(prev => Math.min(100, prev + 20)); setScenarioIdx(Math.floor(Math.random() * scenarios.length)); } }
      ]
    }
  ];

  useEffect(() => {
    if (hp <= 0) {
      setGameOver(true);
    }
  }, [hp]);

  const restartGame = () => {
    setHp(100);
    setGold(0);
    setLevel(1);
    setScenarioIdx(0);
    setGameOver(false);
  };

  const currentScenario = scenarios[scenarioIdx];

  return (
    <div style={{
      maxWidth: '700px',
      width: '100%',
      margin: '0 auto',
      background: '#2a2a2a',
      borderRadius: '20px',
      padding: '40px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h2 style={{ textAlign: 'center', color: '#ffd700', marginBottom: '30px', fontSize: '2.5rem' }}>🏰 RPG Adventure</h2>
      
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '30px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#888', fontSize: '0.9rem', textTransform: 'uppercase' }}>HP</div>
          <div style={{ color: hp < 30 ? '#ef4444' : '#ffd700', fontSize: '1.8rem', fontWeight: 'bold' }}>{hp}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#888', fontSize: '0.9rem', textTransform: 'uppercase' }}>Gold</div>
          <div style={{ color: '#ffd700', fontSize: '1.8rem', fontWeight: 'bold' }}>{gold}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#888', fontSize: '0.9rem', textTransform: 'uppercase' }}>Level</div>
          <div style={{ color: '#ffd700', fontSize: '1.8rem', fontWeight: 'bold' }}>{level}</div>
        </div>
      </div>

      <div style={{
        background: '#1a1a1a',
        padding: '30px',
        borderRadius: '15px',
        marginBottom: '30px',
        minHeight: '150px',
        fontSize: '1.2rem',
        lineHeight: '1.6',
        borderLeft: '5px solid #ffd700'
      }}>
        {gameOver ? "Game Over! You have fallen in battle." : currentScenario.text}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {gameOver ? (
          <button
            onClick={restartGame}
            style={{
              padding: '18px 25px',
              fontSize: '1.2rem',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              background: '#ffd700',
              color: '#1a1a1a',
              fontWeight: 'bold',
              transition: 'all 0.3s'
            }}
          >
            Restart Adventure
          </button>
        ) : (
          currentScenario.choices.map((choice, i) => (
            <button
              key={i}
              onClick={choice.action}
              style={{
                padding: '18px 25px',
                fontSize: '1.1rem',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                background: '#ffd700',
                color: '#1a1a1a',
                fontWeight: 'bold',
                textAlign: 'left',
                transition: 'all 0.3s',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ffed4e';
                e.currentTarget.style.transform = 'translateX(10px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffd700';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <span>{choice.text}</span>
              <span style={{ fontSize: '1.5rem' }}>→</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default RPGAdventure;
