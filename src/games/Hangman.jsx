import { useState, useEffect, useRef } from 'react'

const WORDS = [
  'JAVASCRIPT','PYTHON','PROGRAMMING','COMPUTER','KEYBOARD',
  'INTERNET','DATABASE','ALGORITHM','DEVELOPER','SOFTWARE',
  'HARDWARE','NETWORK','SECURITY','FUNCTION','VARIABLE',
  'DOCUMENT','BROWSER','APPLICATION','TECHNOLOGY','DIGITAL'
]
const MAX = 6

const SVG_PARTS = (n) => (
  <svg viewBox="0 0 200 280" width="200" height="180" className="hm-svg">
    {/* gallows */}
    <line x1="20" y1="270" x2="180" y2="270" stroke="#4c1d95" strokeWidth="4" strokeLinecap="round"/>
    {n >= 1 && <line x1="60"  y1="270" x2="60"  y2="20"  stroke="#6d28d9" strokeWidth="4" strokeLinecap="round"/>}
    {n >= 2 && <line x1="60"  y1="20"  x2="155" y2="20"  stroke="#6d28d9" strokeWidth="4" strokeLinecap="round"/>}
    {n >= 3 && <line x1="155" y1="20"  x2="155" y2="55"  stroke="#6d28d9" strokeWidth="4" strokeLinecap="round"/>}
    {/* figure */}
    {n >= 4 && <circle cx="155" cy="75" r="22" fill="none" stroke="#f87171" strokeWidth="4"/>}
    {n >= 5 && <line x1="155" y1="97"  x2="155" y2="175" stroke="#f87171" strokeWidth="4" strokeLinecap="round"/>}
    {n >= 6 && <>
      <line x1="155" y1="120" x2="125" y2="148" stroke="#f87171" strokeWidth="4" strokeLinecap="round"/>
      <line x1="155" y1="120" x2="185" y2="148" stroke="#f87171" strokeWidth="4" strokeLinecap="round"/>
      <line x1="155" y1="175" x2="125" y2="225" stroke="#f87171" strokeWidth="4" strokeLinecap="round"/>
      <line x1="155" y1="175" x2="185" y2="225" stroke="#f87171" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="148" cy="68" r="3" fill="#f87171"/>
      <circle cx="162" cy="68" r="3" fill="#f87171"/>
      <path d="M148 86 Q155 80 162 86" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"/>
    </>}
  </svg>
)

export default function Hangman() {
  const [word, setWord]       = useState('')
  const [guessed, setGuessed] = useState([])
  const [wrong, setWrong]     = useState(0)
  const [score, setScore]     = useState(0)
  const [status, setStatus]   = useState('playing')
  const [lastGuess, setLast]  = useState(null)

  const newGame = () => {
    setWord(WORDS[Math.floor(Math.random() * WORDS.length)])
    setGuessed([])
    setWrong(0)
    setStatus('playing')
    setLast(null)
  }

  useEffect(() => { newGame() }, [])

  const guess = (l) => {
    if (status !== 'playing' || guessed.includes(l)) return
    const ng = [...guessed, l]
    setGuessed(ng)
    setLast({ l, correct: word.includes(l) })
    if (!word.includes(l)) {
      const nw = wrong + 1
      setWrong(nw)
      if (nw >= MAX) setStatus('lost')
    } else {
      if (word.split('').every(c => ng.includes(c))) {
        setStatus('won')
        setScore(s => s + 1)
      }
    }
  }

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  const danger = wrong >= 4

  return (
    <>
      <style>{HM_STYLES}</style>
      <div className="hm-root">
        <div className="hm-orb hm-orb-1" /><div className="hm-orb hm-orb-2" />

        {/* header */}
        <div className="hm-header">
          <div className="hm-stat">
            <span className="hm-stat-label">Score</span>
            <span className="hm-stat-val" style={{ color:'#4ade80' }}>{score}</span>
          </div>
          <div className="hm-stat">
            <span className="hm-stat-label">Wrong</span>
            <span className="hm-stat-val" style={{ color: danger ? '#f87171' : '#a78bfa' }}>{wrong}/{MAX}</span>
          </div>
        </div>

        {/* lives bar */}
        <div className="hm-lives">
          {Array(MAX).fill(null).map((_, i) => (
            <div key={i} className="hm-life" style={{ background: i < wrong ? '#f87171' : '#4ade80' }} />
          ))}
        </div>

        {/* SVG gallows */}
        <div className="hm-gallows">
          {SVG_PARTS(wrong)}
        </div>

        {/* word display */}
        <div className="hm-word">
          {word.split('').map((l, i) => {
            const shown = guessed.includes(l)
            return (
              <div key={i} className={`hm-letter ${shown ? 'hm-letter--shown' : ''}`}>
                <span>{shown ? l : ''}</span>
              </div>
            )
          })}
        </div>

        {/* status */}
        {status === 'won' && (
          <div className="hm-banner hm-banner--win">🎉 You Won! The word was {word}</div>
        )}
        {status === 'lost' && (
          <div className="hm-banner hm-banner--lose">💀 Game Over! The word was <strong>{word}</strong></div>
        )}

        {/* keyboard */}
        <div className="hm-keyboard">
          {letters.map(l => {
            const used = guessed.includes(l)
            const ok   = word.includes(l) && used
            const bad  = !word.includes(l) && used
            return (
              <button
                key={l}
                className={`hm-key ${ok ? 'hm-key--ok' : bad ? 'hm-key--bad' : 'hm-key--idle'} ${lastGuess?.l === l ? 'hm-key--last' : ''}`}
                onClick={() => guess(l)}
                disabled={used || status !== 'playing'}
              >{l}</button>
            )
          })}
        </div>

        <button className="hm-btn" onClick={newGame}>🔄 New Word</button>
      </div>
    </>
  )
}

const HM_STYLES = `
  @keyframes hm-orb { 0%,100%{transform:translate(0,0)} 40%{transform:translate(20px,-15px)} 70%{transform:translate(-12px,8px)} }
  @keyframes hm-letter-in { from{transform:translateY(-8px) scale(0.8);opacity:0} to{transform:translateY(0) scale(1);opacity:1} }
  @keyframes hm-key-pop { from{transform:scale(0.7)} to{transform:scale(1)} }
  @keyframes hm-banner-in { from{opacity:0;transform:scale(0.85) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes hm-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  .hm-root { position:relative;display:flex;flex-direction:column;align-items:center;gap:12px;padding:24px 16px 32px;overflow:hidden; }
  .hm-orb { position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none;z-index:0;animation:hm-orb 9s ease-in-out infinite; }
  .hm-orb-1 { width:240px;height:240px;background:rgba(139,92,246,0.12);top:-50px;left:-40px; }
  .hm-orb-2 { width:200px;height:200px;background:rgba(248,113,113,0.1);bottom:-40px;right:-40px;animation-delay:-4s; }

  .hm-header { position:relative;z-index:1;display:flex;gap:20px;animation:hm-in 0.4s ease; }
  .hm-stat { display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 16px;border-radius:14px;background:rgba(15,23,42,0.65);border:1px solid rgba(139,92,246,0.22);backdrop-filter:blur(10px); }
  .hm-stat-label { font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b; }
  .hm-stat-val { font-size:22px;font-weight:800; }

  .hm-lives { position:relative;z-index:1;display:flex;gap:6px; }
  .hm-life { width:28px;height:8px;border-radius:4px;transition:background 0.3s ease; }

  .hm-gallows { position:relative;z-index:1;padding:4px;border-radius:16px;background:rgba(15,23,42,0.65);border:1.5px solid rgba(139,92,246,0.22);backdrop-filter:blur(10px); }
  .hm-svg { display:block; }

  .hm-word { position:relative;z-index:1;display:flex;gap:6px;flex-wrap:wrap;justify-content:center; }
  .hm-letter { width:36px;height:44px;border-bottom:3px solid rgba(139,92,246,0.5);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#f1f5f9; }
  .hm-letter--shown { animation:hm-letter-in 0.25s cubic-bezier(0.34,1.2,0.64,1);border-bottom-color:#a78bfa; }

  .hm-banner { position:relative;z-index:1;padding:12px 24px;border-radius:16px;font-size:14px;font-weight:700;animation:hm-banner-in 0.4s ease; }
  .hm-banner--win { background:rgba(74,222,128,0.15);border:1.5px solid rgba(74,222,128,0.4);color:#4ade80; }
  .hm-banner--lose { background:rgba(248,113,113,0.15);border:1.5px solid rgba(248,113,113,0.4);color:#f87171; }

  .hm-keyboard { position:relative;z-index:1;display:grid;grid-template-columns:repeat(auto-fit,minmax(34px,1fr));gap:5px;width:100%;max-width:520px; }
  .hm-key { padding:8px 4px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;border:1.5px solid rgba(139,92,246,0.3);transition:all 0.15s ease;background:rgba(15,23,42,0.65);color:#94a3b8;backdrop-filter:blur(6px); }
  .hm-key:hover:not(:disabled) { border-color:#8b5cf6;color:#f1f5f9;transform:translateY(-2px); }
  .hm-key--ok  { background:rgba(74,222,128,0.18)!important;border-color:#4ade80!important;color:#4ade80!important;opacity:0.7; }
  .hm-key--bad { background:rgba(248,113,113,0.18)!important;border-color:#f87171!important;color:#f87171!important;opacity:0.5; }
  .hm-key--last { animation:hm-key-pop 0.2s ease; }
  .hm-key:disabled { cursor:default; }

  .hm-btn { position:relative;z-index:1;padding:12px 28px;border-radius:14px;background:linear-gradient(135deg,#8b5cf6,#06b6d4);border:none;color:#fff;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 6px 18px rgba(139,92,246,0.4);transition:all 0.25s ease; }
  .hm-btn:hover { transform:translateY(-3px);box-shadow:0 10px 26px rgba(139,92,246,0.55); }
`
