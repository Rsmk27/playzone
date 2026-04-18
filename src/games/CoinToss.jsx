import { useState, useRef } from 'react'

const STREAK_MSGS = { 2:'🔥 2-streak!', 3:'🔥🔥 3-streak!', 4:'🚀 4-streak!', 5:'⚡ 5-streak!' }

export default function CoinToss() {
  const [tally, setTally]     = useState({ heads: 0, tails: 0, wins: 0, losses: 0 })
  const [result, setResult]   = useState(null)   // 'Heads' | 'Tails'
  const [choice, setChoice]   = useState(null)
  const [flipping, setFlipping] = useState(false)
  const [face, setFace]       = useState('heads') // which CSS face is shown
  const [streak, setStreak]   = useState(0)
  const [history, setHistory] = useState([])      // 'W'|'L' last 10
  const [bursts, setBursts]   = useState([])
  const burstRef = useRef(0)

  const addBurst = (won) => {
    const id    = ++burstRef.current
    const color = won ? '#4ade80' : '#f87171'
    setBursts(b => [...b, { id, color }])
    setTimeout(() => setBursts(b => b.filter(x => x.id !== id)), 900)
  }

  const flip = (picked) => {
    if (flipping) return
    setChoice(picked)
    setFlipping(true)
    setResult(null)

    const outcome = Math.random() < 0.5 ? 'Heads' : 'Tails'
    const won = outcome === picked

    // rapid random flicker then settle
    let ticks = 0
    const total = 14
    const iv = setInterval(() => {
      ticks++
      setFace(ticks % 2 === 0 ? 'heads' : 'tails')
      if (ticks >= total) {
        clearInterval(iv)
        setFace(outcome.toLowerCase())
        setResult(outcome)
        setFlipping(false)
        setTally(prev => ({
          heads:  prev.heads  + (outcome === 'Heads' ? 1 : 0),
          tails:  prev.tails  + (outcome === 'Tails' ? 1 : 0),
          wins:   prev.wins   + (won ? 1 : 0),
          losses: prev.losses + (won ? 0 : 1),
        }))
        setStreak(s => won ? s + 1 : 0)
        setHistory(h => [...h.slice(-9), won ? 'W' : 'L'])
        addBurst(won)
      }
    }, 80)
  }

  const total = tally.wins + tally.losses || 1
  const winPct = Math.round((tally.wins / total) * 100)

  return (
    <>
      <style>{CT_STYLES}</style>

      {/* particle bursts */}
      {bursts.map(b => <Burst key={b.id} color={b.color} />)}

      <div className="ct-root">
        <div className="ct-orb ct-orb-1" />
        <div className="ct-orb ct-orb-2" />

        {/* scoreboard */}
        <div className="ct-scoreboard">
          <StatBox label="Heads" value={tally.heads} color="#fbbf24" />
          <div className="ct-sb-mid">
            <div className="ct-winbar">
              <div className="ct-winbar-fill" style={{ width: `${winPct}%` }} />
            </div>
            <div className="ct-sb-label">{winPct}% win rate</div>
            <div className="ct-sb-label">{tally.wins}W – {tally.losses}L</div>
          </div>
          <StatBox label="Tails" value={tally.tails} color="#a78bfa" />
        </div>

        {/* streak */}
        {streak >= 2 && (
          <div className="ct-streak">{STREAK_MSGS[Math.min(streak, 5)] ?? `🔥${streak}-streak!`}</div>
        )}

        {/* coin */}
        <div className={`ct-scene ${flipping ? 'ct-scene--flipping' : ''}`}>
          <div className={`ct-coin ct-coin--${face}`}>
            <div className="ct-face ct-face--heads">
              <span className="ct-coin-sym">H</span>
              <span className="ct-coin-text">HEADS</span>
            </div>
            <div className="ct-face ct-face--tails">
              <span className="ct-coin-sym">T</span>
              <span className="ct-coin-text">TAILS</span>
            </div>
          </div>
        </div>

        {/* result message */}
        {result && !flipping && (
          <div
            className="ct-result"
            style={{ '--rc': result === choice ? '#4ade80' : '#f87171' }}
          >
            {result === choice ? '🎉 You Won!' : '💀 You Lost!'}
            <span className="ct-result-sub"> — landed {result}</span>
          </div>
        )}

        {/* buttons */}
        <div className="ct-choices">
          <button
            className={`ct-btn ct-btn--heads ${choice === 'Heads' && result ? (result === 'Heads' ? 'ct-btn--correct' : 'ct-btn--wrong') : ''}`}
            onClick={() => flip('Heads')}
            disabled={flipping}
          >
            🌟 Heads
          </button>
          <button
            className={`ct-btn ct-btn--tails ${choice === 'Tails' && result ? (result === 'Tails' ? 'ct-btn--correct' : 'ct-btn--wrong') : ''}`}
            onClick={() => flip('Tails')}
            disabled={flipping}
          >
            🌙 Tails
          </button>
        </div>

        {/* history dots */}
        {history.length > 0 && (
          <div className="ct-history">
            {history.map((h, i) => (
              <div key={i} className={`ct-dot ct-dot--${h === 'W' ? 'win' : 'lose'}`} title={h === 'W' ? 'Win' : 'Loss'} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function StatBox({ label, value, color }) {
  return (
    <div className="ct-stat" style={{ '--sc': color }}>
      <span className="ct-stat-label">{label}</span>
      <span className="ct-stat-val">{value}</span>
    </div>
  )
}

function Burst({ color }) {
  const items = Array.from({ length: 16 }, (_, i) => {
    const angle = (360 / 16) * i
    const dist  = 50 + Math.random() * 60
    const dx    = Math.cos((angle * Math.PI) / 180) * dist
    const dy    = Math.sin((angle * Math.PI) / 180) * dist
    return { i, dx, dy }
  })
  return (
    <div className="ct-burst-wrap" aria-hidden>
      {items.map(p => (
        <span key={p.i} className="ct-burst-particle"
          style={{ color, '--dx': `${p.dx}px`, '--dy': `${p.dy}px` }}>
          {'★✦◆▲♥●'.charAt(p.i % 6)}
        </span>
      ))}
    </div>
  )
}

const CT_STYLES = `
  @keyframes ct-particle {
    0%   { transform:translate(0,0) scale(1); opacity:1; }
    100% { transform:translate(var(--dx),var(--dy)) scale(0); opacity:0; }
  }
  @keyframes ct-orb { 0%,100%{transform:translate(0,0)}40%{transform:translate(22px,-16px)}70%{transform:translate(-14px,10px)} }
  @keyframes ct-flip { 0%{transform:rotateY(0)}100%{transform:rotateY(720deg)} }
  @keyframes ct-streak-pop { 0%,100%{transform:scale(1)}50%{transform:scale(1.08)} }
  @keyframes ct-slide-up { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
  @keyframes ct-result-in { from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)} }

  .ct-root {
    position:relative; display:flex; flex-direction:column;
    align-items:center; gap:18px; padding:24px 16px 32px;
    overflow:hidden; min-height:520px;
  }
  .ct-orb { position:absolute; border-radius:50%; filter:blur(70px); pointer-events:none; z-index:0; animation:ct-orb 9s ease-in-out infinite; }
  .ct-orb-1 { width:240px;height:240px;background:rgba(251,191,36,0.12);top:-50px;left:-50px; }
  .ct-orb-2 { width:200px;height:200px;background:rgba(167,139,250,0.12);bottom:-40px;right:-40px;animation-delay:-4s; }

  /* scoreboard */
  .ct-scoreboard {
    position:relative;z-index:1;display:flex;align-items:center;gap:20px;
    background:rgba(15,23,42,0.6);border:1px solid rgba(139,92,246,0.22);
    border-radius:20px;padding:14px 24px;backdrop-filter:blur(14px);
    width:100%;max-width:380px;animation:ct-slide-up 0.4s ease;
  }
  .ct-stat { flex:1;display:flex;flex-direction:column;align-items:center;gap:2px; }
  .ct-stat-label { font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8; }
  .ct-stat-val { font-size:32px;font-weight:800;color:var(--sc);line-height:1; }
  .ct-sb-mid { flex:1.5;display:flex;flex-direction:column;align-items:center;gap:5px; }
  .ct-winbar { width:100%;height:6px;background:rgba(139,92,246,0.12);border-radius:99px;overflow:hidden; }
  .ct-winbar-fill { height:100%;background:linear-gradient(90deg,#4ade80,#06b6d4);border-radius:99px;transition:width 0.6s cubic-bezier(0.4,0,0.2,1); }
  .ct-sb-label { font-size:11px;color:#64748b; }

  /* streak */
  .ct-streak {
    position:relative;z-index:1;
    background:linear-gradient(135deg,#f59e0b,#ef4444);
    padding:6px 20px;border-radius:99px;
    font-size:13px;font-weight:700;color:#fff;
    animation:ct-streak-pop 1.2s ease-in-out infinite;
    box-shadow:0 4px 16px rgba(245,158,11,0.4);
  }

  /* 3D coin */
  .ct-scene {
    position:relative;z-index:1;
    width:140px;height:140px;perspective:600px;
    cursor:default;
  }
  .ct-coin {
    width:100%;height:100%;position:relative;
    transform-style:preserve-3d;
    transition:transform 0.12s ease;
  }
  .ct-scene--flipping .ct-coin { animation:ct-flip 1.12s linear forwards; }
  .ct-coin--tails .ct-coin:not(.ct-scene--flipping .ct-coin) { transform:rotateY(180deg); }
  .ct-face {
    position:absolute;inset:0;
    border-radius:50%;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    backface-visibility:hidden;
    border:4px solid rgba(255,255,255,0.15);
    box-shadow:0 8px 32px rgba(0,0,0,0.4), inset 0 2px 8px rgba(255,255,255,0.1);
  }
  .ct-face--heads {
    background:radial-gradient(circle at 35% 35%, #fde68a, #d97706);
    box-shadow:0 8px 32px rgba(251,191,36,0.4), inset 0 2px 8px rgba(255,255,255,0.2);
  }
  .ct-face--tails {
    background:radial-gradient(circle at 35% 35%, #c4b5fd, #7c3aed);
    transform:rotateY(180deg);
    box-shadow:0 8px 32px rgba(167,139,250,0.4), inset 0 2px 8px rgba(255,255,255,0.2);
  }
  .ct-coin-sym { font-size:44px;font-weight:900;color:rgba(0,0,0,0.35);line-height:1; }
  .ct-coin-text { font-size:11px;font-weight:700;letter-spacing:2px;color:rgba(0,0,0,0.3);text-transform:uppercase; }

  /* result */
  .ct-result {
    position:relative;z-index:1;
    padding:10px 24px;border-radius:99px;
    border:2px solid var(--rc);color:var(--rc);
    background:rgba(15,23,42,0.7);
    font-size:17px;font-weight:800;letter-spacing:0.5px;
    box-shadow:0 0 20px var(--rc);backdrop-filter:blur(8px);
    animation:ct-result-in 0.4s cubic-bezier(0.34,1.56,0.64,1);
  }
  .ct-result-sub { font-size:13px;font-weight:500;opacity:0.75; }

  /* buttons */
  .ct-choices { position:relative;z-index:1;display:flex;gap:14px; }
  .ct-btn {
    padding:14px 28px;border-radius:16px;border:2px solid transparent;
    font-size:16px;font-weight:700;cursor:pointer;
    transition:all 0.25s ease;
  }
  .ct-btn--heads {
    background:rgba(251,191,36,0.12);border-color:rgba(251,191,36,0.5);
    color:#fbbf24;box-shadow:0 0 0 0 rgba(251,191,36,0.3);
  }
  .ct-btn--heads:hover:not(:disabled) { background:rgba(251,191,36,0.22);box-shadow:0 6px 20px rgba(251,191,36,0.4);transform:translateY(-3px); }
  .ct-btn--tails {
    background:rgba(167,139,250,0.12);border-color:rgba(167,139,250,0.5);
    color:#a78bfa;
  }
  .ct-btn--tails:hover:not(:disabled) { background:rgba(167,139,250,0.22);box-shadow:0 6px 20px rgba(167,139,250,0.4);transform:translateY(-3px); }
  .ct-btn--correct { border-color:#4ade80 !important;box-shadow:0 0 16px rgba(74,222,128,0.4) !important; }
  .ct-btn--wrong   { border-color:#f87171 !important;box-shadow:0 0 16px rgba(248,113,113,0.4) !important; }
  .ct-btn:disabled { opacity:0.45;cursor:not-allowed;transform:none; }

  /* history dots */
  .ct-history { position:relative;z-index:1;display:flex;gap:6px;align-items:center; }
  .ct-dot { width:10px;height:10px;border-radius:50%; }
  .ct-dot--win  { background:#4ade80;box-shadow:0 0 6px rgba(74,222,128,0.6); }
  .ct-dot--lose { background:#f87171;box-shadow:0 0 6px rgba(248,113,113,0.4); }

  /* burst */
  .ct-burst-wrap { position:fixed;top:40%;left:50%;pointer-events:none;z-index:9999; }
  .ct-burst-particle {
    position:absolute;font-size:14px;
    animation:ct-particle 0.85s ease-out forwards;
  }
`
