'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

import { GAMES } from '@/lib/constants';

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
