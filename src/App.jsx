import { useState, useEffect, lazy, Suspense, useMemo } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'
// ⚡ Bolt Optimization: Lazy load game components to reduce initial bundle size from ~429KB to ~175KB.
const RockPaperScissors = lazy(() => import('./games/RockPaperScissors'))
const TicTacToe = lazy(() => import('./games/TicTacToe'))
const NumberGuessing = lazy(() => import('./games/NumberGuessing'))
const CoinToss = lazy(() => import('./games/CoinToss'))
const DiceRoller = lazy(() => import('./games/DiceRoller'))
const ColorGuessing = lazy(() => import('./games/ColorGuessing'))
const CPSCounter = lazy(() => import('./games/CPSCounter'))
const MathQuiz = lazy(() => import('./games/MathQuiz'))
const ReactionTest = lazy(() => import('./games/ReactionTest'))
const WhackAMole = lazy(() => import('./games/WhackAMole'))
const Quiz = lazy(() => import('./games/Quiz'))
const TypingTest = lazy(() => import('./games/TypingTest'))
const MemoryCards = lazy(() => import('./games/MemoryCards'))
const Hangman = lazy(() => import('./games/Hangman'))
const ConnectFour = lazy(() => import('./games/ConnectFour'))
const SimonSays = lazy(() => import('./games/SimonSays'))
const SlidingPuzzle = lazy(() => import('./games/SlidingPuzzle'))
const Minesweeper = lazy(() => import('./games/Minesweeper'))
const Sudoku = lazy(() => import('./games/Sudoku'))
const Snake = lazy(() => import('./games/Snake'))
const FlappyBird = lazy(() => import('./games/FlappyBird'))
const Breakout = lazy(() => import('./games/Breakout'))
const Pong = lazy(() => import('./games/Pong'))
const SpaceInvaders = lazy(() => import('./games/SpaceInvaders'))
const Asteroids = lazy(() => import('./games/Asteroids'))
const Shooter2D = lazy(() => import('./games/Shooter2D'))
const CarRacing = lazy(() => import('./games/CarRacing'))
const Helicopter = lazy(() => import('./games/Helicopter'))
const CatchObject = lazy(() => import('./games/CatchObject'))
const PhysicsBalls = lazy(() => import('./games/PhysicsBalls'))
const Platformer = lazy(() => import('./games/Platformer'))
const Game2048 = lazy(() => import('./games/Game2048'))
const Chess = lazy(() => import('./games/Chess'))
const Checkers = lazy(() => import('./games/Checkers'))
const Reversi = lazy(() => import('./games/Reversi'))
const RPGAdventure = lazy(() => import('./games/RPGAdventure'))
const Ludo = lazy(() => import('./games/Ludo'))
const LightsOut = lazy(() => import('./games/LightsOut'))
const Maze = lazy(() => import('./games/Maze'))
const TypingAttack = lazy(() => import('./games/TypingAttack'))
const WordSearch = lazy(() => import('./games/WordSearch'))
const TowerOfHanoi = lazy(() => import('./games/TowerOfHanoi'))
import MobileControls from './components/MobileControls'
const GAMES = [
  { slug: 'rock-paper-scissors', title: 'Rock–Paper–Scissors', category: 'Beginner', emoji: '✊✋✌️' },
  { slug: 'tic-tac-toe', title: 'Tic‑Tac‑Toe', category: 'Beginner', emoji: '❌⭕' },
  { slug: 'number-guessing', title: 'Number Guessing', category: 'Beginner', emoji: '🔢' },
  { slug: 'coin-toss', title: 'Coin Toss', category: 'Beginner', emoji: '🪙' },
  { slug: 'dice-roller', title: 'Dice Roller', category: 'Beginner', emoji: '🎲' },
  { slug: 'quiz', title: 'Quiz / Trivia', category: 'Beginner', emoji: '❓' },
  { slug: 'typing-test', title: 'Typing Speed Test', category: 'Beginner', emoji: '⌨️' },
  { slug: 'color-guessing', title: 'Color Guessing', category: 'Beginner', emoji: '🎨' },
  { slug: 'whack-a-mole', title: 'Whack‑a‑Mole', category: 'Beginner', emoji: '🐹' },
  { slug: 'memory-cards', title: 'Memory Cards', category: 'Medium', emoji: '🃏' },
  { slug: 'hangman', title: 'Hangman', category: 'Medium', emoji: '🪢' },
  { slug: 'connect-four', title: 'Connect Four', category: 'Medium', emoji: '🔴🟡' },
  { slug: 'simon-says', title: 'Simon Says', category: 'Medium', emoji: '🎵' },
  { slug: 'sliding-puzzle', title: 'Sliding Puzzle', category: 'Medium', emoji: '🧩' },
  { slug: 'minesweeper', title: 'Minesweeper', category: 'Medium', emoji: '💣' },
  { slug: 'sudoku', title: 'Sudoku', category: 'Medium', emoji: '🔢' },
  { slug: 'word-search', title: 'Word Search', category: 'Medium', emoji: '✏️' },
  { slug: 'tower-of-hanoi', title: 'Tower of Hanoi', category: 'Medium', emoji: '🗼' },
  { slug: 'snake', title: 'Snake', category: 'Arcade', emoji: '🐍' },
  { slug: 'flappy-bird', title: 'Flappy Bird', category: 'Arcade', emoji: '🐦' },
  { slug: 'breakout', title: 'Breakout', category: 'Arcade', emoji: '🧱' },
  { slug: 'pong', title: 'Pong', category: 'Arcade', emoji: '🏓' },
  { slug: 'space-invaders', title: 'Space Invaders', category: 'Arcade', emoji: '👾' },
  { slug: 'asteroids', title: 'Asteroids', category: 'Arcade', emoji: '☄️' },
  { slug: 'shooter-2d', title: '2D Shooter', category: 'Arcade', emoji: '🔫' },
  { slug: 'car-racing', title: 'Car Racing', category: 'Arcade', emoji: '🏎️' },
  { slug: 'helicopter', title: 'Helicopter', category: 'Arcade', emoji: '🚁' },
  { slug: 'catch-object', title: 'Catch Object', category: 'Arcade', emoji: '🪃' },
  { slug: 'physics-balls', title: 'Physics Balls', category: 'Arcade', emoji: '⚽' },
  { slug: 'platformer', title: 'Platformer', category: 'Arcade', emoji: '🏃' },
  { slug: '2048', title: '2048', category: 'Advanced', emoji: '2️⃣' },
  { slug: 'chess', title: 'Chess', category: 'Advanced', emoji: '♟️' },
  { slug: 'checkers', title: 'Checkers', category: 'Advanced', emoji: '⭕' },
  { slug: 'reversi', title: 'Reversi', category: 'Advanced', emoji: '⚫⚪' },
  { slug: 'rpg-adventure', title: 'RPG Adventure', category: 'Advanced', emoji: '🗡️' },
  { slug: 'ludo', title: 'Ludo', category: 'Advanced', emoji: '🎯' },
  { slug: 'lights-out', title: 'Lights Out', category: 'Advanced', emoji: '💡' },
  { slug: 'maze', title: 'Maze', category: 'Advanced', emoji: '🌀' },
  { slug: 'reaction-test', title: 'Reaction Test', category: 'Extras', emoji: '⚡' },
  { slug: 'cps-counter', title: 'CPS Counter', category: 'Extras', emoji: '👆' },
  { slug: 'typing-attack', title: 'Typing Attack', category: 'Extras', emoji: '⌨️' },
  { slug: 'math-quiz', title: 'Math Quiz', category: 'Extras', emoji: '➕' },
]

const CATEGORIES = ['All', 'Beginner', 'Medium', 'Arcade', 'Advanced', 'Extras']

const gameComponents = {
  'rock-paper-scissors': RockPaperScissors,
  'tic-tac-toe': TicTacToe,
  'number-guessing': NumberGuessing,
  'coin-toss': CoinToss,
  'dice-roller': DiceRoller,
  'color-guessing': ColorGuessing,
  'cps-counter': CPSCounter,
  'math-quiz': MathQuiz,
  'reaction-test': ReactionTest,
  'whack-a-mole': WhackAMole,
  'quiz': Quiz,
  'typing-test': TypingTest,
  'memory-cards': MemoryCards,
  'hangman': Hangman,
  'connect-four': ConnectFour,
  'simon-says': SimonSays,
  'sliding-puzzle': SlidingPuzzle,
  'minesweeper': Minesweeper,
  'sudoku': Sudoku,
  'snake': Snake,
  'flappy-bird': FlappyBird,
  'breakout': Breakout,
  'pong': Pong,
  'space-invaders': SpaceInvaders,
  'asteroids': Asteroids,
  'shooter-2d': Shooter2D,
  'car-racing': CarRacing,
  'helicopter': Helicopter,
  'catch-object': CatchObject,
  'physics-balls': PhysicsBalls,
  'platformer': Platformer,
  '2048': Game2048,
  'chess': Chess,
  'checkers': Checkers,
  'reversi': Reversi,
  'rpg-adventure': RPGAdventure,
  'ludo': Ludo,
  'lights-out': LightsOut,
  'maze': Maze,
  'typing-attack': TypingAttack,
  'word-search': WordSearch,
  'tower-of-hanoi': TowerOfHanoi,
}


function Home() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const navigate = useNavigate()

  // ⚡ Bolt Optimization: Memoize filtered games and extract toLowerCase() to prevent unnecessary re-computations on every render.
  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase()
    return GAMES.filter(g => {
      const matchesSearch = g.title.toLowerCase().includes(searchLower) || g.slug.includes(searchLower)
      const matchesCategory = category === 'All' || g.category === category
      return matchesSearch && matchesCategory
    })
  }, [search, category])

  return (
    <div className="container">
      <div className="header">
        <div className="brand" onClick={() => navigate('/')}>
          <div className="logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            </svg>
          </div>
          <div>
            <h1>PlayZone</h1>
            <div className="tag">Play & Relax</div>
          </div>
        </div>
        <input
          className="search"
          placeholder="Search games… (e.g., snake, quiz)"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="kicker">
        {CATEGORIES.map(cat => (
          <span
            key={cat}
            className={`pill ${category === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </span>
        ))}
      </div>

      <div className="grid">
        {filtered.map(game => (
          <Link key={game.slug} to={`/game/${game.slug}`} className="card">
            <span className="badge">{game.category}</span>
            <div className="thumb">{game.emoji}</div>
            <h3>{game.title}</h3>
            <span className="btn">Play Now</span>
          </Link>
        ))}
      </div>

      <div className="footer">
        © PlayZone · built with ❤️ By <a href="https://rsmk.me" target="_blank" rel="noopener noreferrer" style={{color: 'var(--accent)', textDecoration: 'none', fontWeight: 600}}>RSMK</a>
      </div>
    </div>
  )
}

function GamePage() {
  const { slug } = useParams()
  const game = GAMES.find(g => g.slug === slug)
  const GameComponent = gameComponents[slug]
  
  const [showControls, setShowControls] = useState(() => {
    return window.innerWidth <= 768 && (game?.category === 'Arcade' || game?.category === 'Advanced')
  })

  // Listen to window resizes to auto-hide or show if appropriate
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setShowControls(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!game) {
    return (
      <div className="page">
        <h1>Game not found</h1>
        <Link className="btn" to="/">← Back to Home</Link>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="game-header">
        <h1 className="game-title">{game.emoji} {game.title}</h1>
        <div className="actions">
          {window.innerWidth <= 768 && (
            <button 
              className="btn" 
              style={{ background: showControls ? 'var(--danger)' : 'var(--accent)', padding: '10px 14px' }}
              onClick={() => setShowControls(c => !c)}
            >
              {showControls ? '🎮 Off' : '🎮 On'}
            </button>
          )}
          <Link className="btn" to="/">← Back to Home</Link>
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
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:slug" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
