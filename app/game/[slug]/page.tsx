'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import MobileControls from '../../../src/components/MobileControls';

import { GAMES } from '@/lib/constants';

const gameComponents: Record<string, React.ComponentType<any>> = {
  'rock-paper-scissors': dynamic(() => import('../../../src/games/RockPaperScissors'), { ssr: false }),
  'tic-tac-toe': dynamic(() => import('../../../src/games/TicTacToe'), { ssr: false }),
  'number-guessing': dynamic(() => import('../../../src/games/NumberGuessing'), { ssr: false }),
  'coin-toss': dynamic(() => import('../../../src/games/CoinToss'), { ssr: false }),
  'dice-roller': dynamic(() => import('../../../src/games/DiceRoller'), { ssr: false }),
  'color-guessing': dynamic(() => import('../../../src/games/ColorGuessing'), { ssr: false }),
  'cps-counter': dynamic(() => import('../../../src/games/CPSCounter'), { ssr: false }),
  'math-quiz': dynamic(() => import('../../../src/games/MathQuiz'), { ssr: false }),
  'reaction-test': dynamic(() => import('../../../src/games/ReactionTest'), { ssr: false }),
  'whack-a-mole': dynamic(() => import('../../../src/games/WhackAMole'), { ssr: false }),
  'quiz': dynamic(() => import('../../../src/games/Quiz'), { ssr: false }),
  'typing-test': dynamic(() => import('../../../src/games/TypingTest'), { ssr: false }),
  'memory-cards': dynamic(() => import('../../../src/games/MemoryCards'), { ssr: false }),
  'hangman': dynamic(() => import('../../../src/games/Hangman'), { ssr: false }),
  'connect-four': dynamic(() => import('../../../src/games/ConnectFour'), { ssr: false }),
  'simon-says': dynamic(() => import('../../../src/games/SimonSays'), { ssr: false }),
  'sliding-puzzle': dynamic(() => import('../../../src/games/SlidingPuzzle'), { ssr: false }),
  'minesweeper': dynamic(() => import('../../../src/games/Minesweeper'), { ssr: false }),
  'sudoku': dynamic(() => import('../../../src/games/Sudoku'), { ssr: false }),
  'snake': dynamic(() => import('../../../src/games/Snake'), { ssr: false }),
  'flappy-bird': dynamic(() => import('../../../src/games/FlappyBird'), { ssr: false }),
  'breakout': dynamic(() => import('../../../src/games/Breakout'), { ssr: false }),
  'pong': dynamic(() => import('../../../src/games/Pong'), { ssr: false }),
  'space-invaders': dynamic(() => import('../../../src/games/SpaceInvaders'), { ssr: false }),
  'asteroids': dynamic(() => import('../../../src/games/Asteroids'), { ssr: false }),
  'shooter-2d': dynamic(() => import('../../../src/games/Shooter2D'), { ssr: false }),
  'car-racing': dynamic(() => import('../../../src/games/CarRacing'), { ssr: false }),
  'helicopter': dynamic(() => import('../../../src/games/Helicopter'), { ssr: false }),
  'catch-object': dynamic(() => import('../../../src/games/CatchObject'), { ssr: false }),
  'physics-balls': dynamic(() => import('../../../src/games/PhysicsBalls'), { ssr: false }),
  'platformer': dynamic(() => import('../../../src/games/Platformer'), { ssr: false }),
  '2048': dynamic(() => import('../../../src/games/Game2048'), { ssr: false }),
  'chess': dynamic(() => import('../../../src/games/Chess'), { ssr: false }),
  'checkers': dynamic(() => import('../../../src/games/Checkers'), { ssr: false }),
  'reversi': dynamic(() => import('../../../src/games/Reversi'), { ssr: false }),
  'rpg-adventure': dynamic(() => import('../../../src/games/RPGAdventure'), { ssr: false }),
  'ludo': dynamic(() => import('../../../src/games/Ludo'), { ssr: false }),
  'lights-out': dynamic(() => import('../../../src/games/LightsOut'), { ssr: false }),
  'maze': dynamic(() => import('../../../src/games/Maze'), { ssr: false }),
  'typing-attack': dynamic(() => import('../../../src/games/TypingAttack'), { ssr: false }),
  'word-search': dynamic(() => import('../../../src/games/WordSearch'), { ssr: false }),
  'tower-of-hanoi': dynamic(() => import('../../../src/games/TowerOfHanoi'), { ssr: false }),
};

export default function GamePage() {
  const { slug } = useParams() as { slug: string };
  const game = GAMES.find(g => g.slug === slug);
  const GameComponent = gameComponents[slug];

  const [showControls, setShowControls] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setShowControls(mobile && (game?.category === 'Arcade' || game?.category === 'Advanced'));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [game]);

  if (!game) {
    return (
      <div className="page">
        <h1>Game not found</h1>
        <Link className="btn" href="/">← Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="game-header">
        <h1 className="game-title">{game.emoji} {game.title}</h1>
        <div className="actions">
          {isMobile && (
            <button 
              className="btn" 
              style={{ background: showControls ? 'var(--danger)' : 'var(--accent)', padding: '10px 14px' }}
              onClick={() => setShowControls(c => !c)}
            >
              {showControls ? '🎮 Off' : '🎮 On'}
            </button>
          )}
          <Link className="btn" href="/">← Back to Home</Link>
        </div>
      </div>
      
      <Suspense fallback={<div className="info">Loading game...</div>}>
        {GameComponent ? (
          <GameComponent title={game.title} />
        ) : (
          <>
            <div className="info">
              This game is still being migrated to React. 
              You can play the classic version below.
            </div>
            <div className="canvas-wrap" style={{ 
              width: '100%', 
              maxWidth: '900px', 
              margin: '0 auto', 
              height: 'min(80vh, 700px)',
              background: 'var(--card)',
              borderRadius: '24px',
              padding: '4px',
              border: '1px solid var(--card-border)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
              <iframe 
                src={`/games/${slug}/index.html`} 
                sandbox="allow-scripts allow-same-origin"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  border: 'none', 
                  borderRadius: '20px',
                  display: 'block'
                }}
                title={game.title}
              />
            </div>
          </>
        )}
      </Suspense>
      <div className="footer" style={{ marginTop: '40px', borderTop: '1px solid rgba(139, 92, 246, 0.1)', paddingTop: '20px' }}>
        © PlayZone · built with ❤️ By <a href="https://rsmk.me" target="_blank" rel="noopener noreferrer" style={{color: 'var(--accent)', textDecoration: 'none', fontWeight: 600}}>RSMK</a>
      </div>
      
      {showControls && <MobileControls />}
    </div>
  );
}
