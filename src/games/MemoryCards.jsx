import { useState, useEffect, useRef } from 'react'

const ICONS = ['🚗','🚒','🏎️','🚑','✈️','🛥️','🚁','🏍️']

export default function MemoryCards() {
  const [cards, setCards]   = useState([])
  const [open, setOpen]     = useState([])
  const [moves, setMoves]   = useState(0)
  const [matched, setMatched] = useState(0)
  const [won, setWon]       = useState(false)
  const [best, setBest]     = useState(Infinity)
  const checking = useRef(false)

  const reset = () => {
    const deck = [...ICONS, ...ICONS]
      .sort(() => Math.random() - 0.5)
      .map((v, i) => ({ id: i, val: v, open: false, done: false }))
    setCards(deck)
    setOpen([])
    setMoves(0)
    setMatched(0)
    setWon(false)
    checking.current = false
  }

  useEffect(() => { reset() }, [])

  const flip = (card) => {
    if (card.done || card.open || open.length === 2 || checking.current) return
    const newCards = cards.map(c => c.id === card.id ? { ...c, open: true } : c)
    setCards(newCards)
    const newOpen = [...open, card]
    setOpen(newOpen)

    if (newOpen.length === 2) {
      setMoves(m => m + 1)
      checking.current = true
      const [a, b] = newOpen
      if (a.val === b.val) {
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === a.id || c.id === b.id ? { ...c, done: true, open: false } : c
          ))
          setMatched(prev => {
            const next = prev + 1
            if (next === ICONS.length) {
              setWon(true)
              setMoves(m => { setBest(b => Math.min(b, m + 1)); return m })
            }
            return next
          })
          setOpen([])
          checking.current = false
        }, 500)
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === a.id || c.id === b.id ? { ...c, open: false } : c
          ))
          setOpen([])
          checking.current = false
        }, 700)
      }
    }
  }

  const progress = (matched / ICONS.length) * 100

  return (
    <>
      <style>{MC_STYLES}</style>
      <div className="mc-root">
        <div className="mc-orb mc-orb-1" />
        <div className="mc-orb mc-orb-2" />

        {/* stats */}
        <div className="mc-stats">
          <StatChip label="Moves"   value={moves}   color="#a78bfa" />
          <StatChip label="Matched" value={`${matched}/${ICONS.length}`} color="#4ade80" />
          <StatChip label="Best"    value={best === Infinity ? '—' : best} color="#fbbf24" />
        </div>

        {/* progress bar */}
        <div className="mc-prog-wrap">
          <div className="mc-prog-bar" style={{ width: `${progress}%` }} />
        </div>

        {/* win banner */}
        {won && (
          <div className="mc-win">
            🎉 Solved in {moves} moves!
            {best <= moves && ' 🏆 New best!'}
          </div>
        )}

        {/* grid */}
        <div className="mc-grid">
          {cards.map(card => (
            <div
              key={card.id}
              className={`mc-card ${card.open ? 'mc-card--open' : ''} ${card.done ? 'mc-card--done' : ''}`}
              onClick={() => flip(card)}
            >
              <div className="mc-card-inner">
                <div className="mc-card-back">
                  <span className="mc-card-qmark">?</span>
                </div>
                <div className="mc-card-front">
                  {card.val}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="mc-btn" onClick={reset}>🔄 New Game</button>
      </div>
    </>
  )
}

function StatChip({ label, value, color }) {
  return (
    <div className="mc-chip" style={{ '--cc': color }}>
      <span className="mc-chip-label">{label}</span>
      <span className="mc-chip-val">{value}</span>
    </div>
  )
}

const MC_STYLES = `
  @keyframes mc-orb { 0%,100%{transform:translate(0,0)} 40%{transform:translate(20px,-15px)} 70%{transform:translate(-12px,8px)} }
  @keyframes mc-flip { 0%{transform:rotateY(0)} 100%{transform:rotateY(180deg)} }
  @keyframes mc-win { from{opacity:0;transform:scale(0.8) translateY(-10px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes mc-done { from{transform:scale(1)} 40%{transform:scale(1.18)} to{transform:scale(1)} }
  @keyframes mc-slide-up { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

  .mc-root { position:relative;display:flex;flex-direction:column;align-items:center;gap:14px;padding:24px 16px 32px;overflow:hidden; }
  .mc-orb { position:absolute;border-radius:50%;filter:blur(72px);pointer-events:none;z-index:0;animation:mc-orb 9s ease-in-out infinite; }
  .mc-orb-1 { width:240px;height:240px;background:rgba(139,92,246,0.12);top:-60px;left:-40px; }
  .mc-orb-2 { width:200px;height:200px;background:rgba(6,182,212,0.10);bottom:-40px;right:-40px;animation-delay:-4s; }

  .mc-stats { position:relative;z-index:1;display:flex;gap:10px;animation:mc-slide-up 0.4s ease; }
  .mc-chip { display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 14px;border-radius:14px;background:rgba(15,23,42,0.65);border:1px solid rgba(139,92,246,0.22);backdrop-filter:blur(10px); }
  .mc-chip-label { font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b; }
  .mc-chip-val { font-size:20px;font-weight:800;color:var(--cc); }

  .mc-prog-wrap { position:relative;z-index:1;width:100%;max-width:380px;height:6px;border-radius:6px;background:rgba(255,255,255,0.07); }
  .mc-prog-bar { height:100%;border-radius:6px;background:linear-gradient(90deg,#8b5cf6,#06b6d4);transition:width 0.4s ease;box-shadow:0 0 8px rgba(139,92,246,0.6); }

  .mc-win { position:relative;z-index:1;padding:12px 24px;border-radius:16px;background:linear-gradient(135deg,rgba(74,222,128,0.18),rgba(6,182,212,0.18));border:1.5px solid rgba(74,222,128,0.4);font-size:15px;font-weight:700;color:#4ade80;animation:mc-win 0.4s cubic-bezier(0.34,1.2,0.64,1); }

  .mc-grid { position:relative;z-index:1;display:grid;grid-template-columns:repeat(4,1fr);gap:10px;width:100%;max-width:380px; }

  .mc-card { perspective:600px;cursor:pointer;height:80px; }
  .mc-card:hover:not(.mc-card--done) .mc-card-inner { transform:rotateY(-15deg) scale(1.04); }
  .mc-card-inner { position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform 0.38s cubic-bezier(0.4,0,0.2,1); }
  .mc-card--open .mc-card-inner { transform:rotateY(180deg); }
  .mc-card--done .mc-card-inner { transform:rotateY(180deg); }
  .mc-card--done { animation:mc-done 0.5s ease; }
  .mc-card-back, .mc-card-front { position:absolute;inset:0;backface-visibility:hidden;border-radius:14px;display:flex;align-items:center;justify-content:center; }
  .mc-card-back { background:linear-gradient(135deg,rgba(139,92,246,0.3),rgba(6,182,212,0.2));border:2px solid rgba(139,92,246,0.3); }
  .mc-card-qmark { font-size:24px;color:#8b5cf6; }
  .mc-card-front { background:rgba(15,23,42,0.8);border:2px solid rgba(74,222,128,0.4);font-size:32px;transform:rotateY(180deg); }
  .mc-card--done .mc-card-front { border-color:rgba(74,222,128,0.7);background:rgba(74,222,128,0.1); }

  .mc-btn { position:relative;z-index:1;padding:12px 28px;border-radius:14px;background:linear-gradient(135deg,#8b5cf6,#06b6d4);border:none;color:#fff;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 6px 18px rgba(139,92,246,0.4);transition:all 0.25s ease; }
  .mc-btn:hover { transform:translateY(-3px);box-shadow:0 10px 26px rgba(139,92,246,0.55); }
`
