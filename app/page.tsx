'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

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
];

const CATEGORIES = ['All', 'Beginner', 'Medium', 'Arcade', 'Advanced', 'Extras'];

export default function Home() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const router = useRouter();

  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();
    return GAMES.filter(g => {
      const matchesSearch = g.title.toLowerCase().includes(searchLower) || g.slug.includes(searchLower);
      const matchesCategory = category === 'All' || g.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    <div className="container">
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="brand">
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
        </Link>
        
        <input
          className="search"
          placeholder="Search games… (e.g., snake, quiz)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: '1', maxWidth: '400px' }}
        />

        <div className="auth-controls" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <SignedIn>
            <Link href="/dashboard" className="btn" style={{ padding: '8px 16px', background: 'var(--accent)', textDecoration: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: 600 }}>
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Link href="/sign-in" className="btn" style={{ padding: '8px 16px', background: 'var(--accent)', textDecoration: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: 600 }}>
              Sign In
            </Link>
          </SignedOut>
        </div>
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
          <Link key={game.slug} href={`/game/${game.slug}`} className="card">
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
  );
}
