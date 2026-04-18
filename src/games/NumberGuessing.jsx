import { useState, useRef, useEffect } from 'react'

const MAX = 100
const MAX_TRIES = 8

// How "hot" is the guess? 0=cold, 1=burning
const proximity = (guess, secret) => 1 - Math.abs(guess - secret) / MAX

export default function NumberGuessing() {
  const [secret, setSecret] = useState(() => rand())
  const [guess, setGuess]   = useState('')
  const [tries, setTries]   = useState(0)
  const [guesses, setGuesses] = useState([])  // {n, hint}
  const [phase, setPhase]   = useState('idle')  // idle | wrong-low | wrong-high | won | lost
  const [wins, setWins]     = useState(0)
  const [losses, setLosses] = useState(0)
  const [shake, setShake]   = useState(false)
  const inputRef            = useRef(null)

  function rand() { return Math.floor(Math.random() * MAX) + 1 }

  const pct   = guesses.at(-1) ? proximity(guesses.at(-1).n, secret) : 0
  const heatColor = pct > 0.85 ? '#f87171' : pct > 0.6 ? '#fb923c' : pct > 0.4 ? '#fbbf24' : '#38bdf8'

  const submit = () => {
    const n = parseInt(guess)
    if (isNaN(n) || n < 1 || n > MAX) return
    const newTries = tries + 1
    setTries(newTries)

    if (n === secret) {
      setGuesses(g => [...g, { n, hint: 'correct' }])
      setPhase('won')
      setWins(w => w + 1)
      setTimeout(() => newGame(), 2000)
    } else if (newTries >= MAX_TRIES) {
      setGuesses(g => [...g, { n, hint: n < secret ? 'low' : 'high' }])
      setPhase('lost')
      setLosses(l => l + 1)
      setTimeout(() => newGame(), 2500)
    } else {
      const hint = n < secret ? 'low' : 'high'
      setGuesses(g => [...g, { n, hint }])
      setPhase(hint === 'low' ? 'wrong-low' : 'wrong-high')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
    setGuess('')
    inputRef.current?.focus()
  }

  const newGame = (full = false) => {
    setSecret(rand())
    setGuess('')
    setTries(0)
    setGuesses([])
    setPhase('idle')
    if (full) { setWins(0); setLosses(0) }
  }

  const hintMsg = {
    idle:       '🔢 Guess a number between 1 and 100',
    'wrong-low':  '⬆️ Too low — go higher!',
    'wrong-high': '⬇️ Too high — go lower!',
    won:        `🎉 Correct! It was ${secret}!`,
    lost:       `💀 Out of tries! It was ${secret}.`,
  }[phase]

  const hintColor = {
    idle: '#94a3b8', 'wrong-low': '#38bdf8', 'wrong-high': '#f87171',
    won: '#4ade80', lost: '#f87171',
  }[phase]

  const triesLeft = MAX_TRIES - tries

  return (
    <>
      <style>{NG_STYLES}</style>
      <div className="ng-root">
        <div className="ng-orb ng-orb-1" />
        <div className="ng-orb ng-orb-2" />

        {/* header stats */}
        <div className="ng-header">
          <StatPill label="Wins"   value={wins}   color="#4ade80" />
          <StatPill label="Losses" value={losses} color="#f87171" />
          <StatPill label={`Tries left`} value={triesLeft} color={triesLeft <= 2 ? '#f87171' : '#fbbf24'} />
        </div>

        {/* hint message */}
        <div className="ng-msg" style={{ color: hintColor, borderColor: hintColor + '55' }}>
          {hintMsg}
        </div>

        {/* heat thermometer */}
        {guesses.length > 0 && phase !== 'won' && phase !== 'lost' && (
          <div className="ng-thermo-wrap">
            <span className="ng-thermo-label">❄️</span>
            <div className="ng-thermo">
              <div
                className="ng-thermo-fill"
                style={{ width: `${pct * 100}%`, background: heatColor, boxShadow: `0 0 12px ${heatColor}` }}
              />
            </div>
            <span className="ng-thermo-label">🔥</span>
          </div>
        )}

        {/* input + button */}
        {(phase === 'idle' || phase === 'wrong-low' || phase === 'wrong-high') && (
          <div className={`ng-input-row ${shake ? 'ng-shake' : ''}`}>
            <input
              ref={inputRef}
              type="number"
              className="ng-input"
              value={guess}
              min={1} max={MAX}
              placeholder="1 – 100"
              onChange={e => setGuess(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              autoFocus
            />
            <button className="ng-btn" onClick={submit}>Guess</button>
          </div>
        )}

        {/* win/lost overlay */}
        {(phase === 'won' || phase === 'lost') && (
          <div className="ng-endcard" style={{ '--ec': phase === 'won' ? '#4ade80' : '#f87171' }}>
            {phase === 'won' ? `🎉 Found in ${tries} ${tries === 1 ? 'try' : 'tries'}!` : `💀 The number was ${secret}`}
          </div>
        )}

        {/* guess history bar chart */}
        {guesses.length > 0 && (
          <div className="ng-history">
            {guesses.map((g, i) => {
              const p = proximity(g.n, secret)
              const col = p > 0.85 ? '#f87171' : p > 0.6 ? '#fb923c' : p > 0.4 ? '#fbbf24' : '#38bdf8'
              return (
                <div key={i} className="ng-hist-item">
                  <div className="ng-hist-bar-wrap">
                    <div
                      className="ng-hist-bar"
                      style={{ height: `${Math.max(p * 56, 8)}px`, background: col, boxShadow: `0 0 8px ${col}` }}
                    />
                  </div>
                  <div className="ng-hist-num" style={{ color: col }}>{g.n}</div>
                  <div className="ng-hist-hint">
                    {g.hint === 'low' ? '↑' : g.hint === 'high' ? '↓' : '✓'}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* reset */}
        <div className="ng-actions">
          <button className="ng-ghost-btn" onClick={() => newGame(false)}>New Number</button>
          <button className="ng-ghost-btn" onClick={() => newGame(true)}>Reset Score</button>
        </div>
      </div>
    </>
  )
}

function StatPill({ label, value, color }) {
  return (
    <div className="ng-stat" style={{ '--sc': color }}>
      <span className="ng-stat-label">{label}</span>
      <span className="ng-stat-val">{value}</span>
    </div>
  )
}

const NG_STYLES = `
  @keyframes ng-orb { 0%,100%{transform:translate(0,0)}40%{transform:translate(20px,-15px)}70%{transform:translate(-12px,8px)} }
  @keyframes ng-shake {
    0%,100%{transform:translateX(0)}15%{transform:translateX(-8px)}30%{transform:translateX(8px)}
    45%{transform:translateX(-6px)}60%{transform:translateX(6px)}75%{transform:translateX(-4px)}90%{transform:translateX(4px)}
  }
  @keyframes ng-slide-up { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
  @keyframes ng-endcard-in { from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)} }
  @keyframes ng-bar-in { from{height:0}to{height:var(--h)} }

  .ng-root {
    position:relative;display:flex;flex-direction:column;
    align-items:center;gap:16px;padding:24px 16px 32px;
    overflow:hidden;min-height:500px;
  }
  .ng-orb { position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none;z-index:0;animation:ng-orb 9s ease-in-out infinite; }
  .ng-orb-1 { width:230px;height:230px;background:rgba(56,189,248,0.12);top:-50px;left:-40px; }
  .ng-orb-2 { width:190px;height:190px;background:rgba(251,191,36,0.1);bottom:-40px;right:-40px;animation-delay:-4s; }

  .ng-header {
    position:relative;z-index:1;display:flex;gap:10px;flex-wrap:wrap;justify-content:center;
    animation:ng-slide-up 0.4s ease;
  }
  .ng-stat {
    display:flex;flex-direction:column;align-items:center;gap:2px;
    padding:8px 16px;border-radius:14px;
    background:rgba(15,23,42,0.65);border:1px solid rgba(139,92,246,0.2);
    backdrop-filter:blur(10px);
  }
  .ng-stat-label { font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b; }
  .ng-stat-val   { font-size:22px;font-weight:800;color:var(--sc); }

  .ng-msg {
    position:relative;z-index:1;
    padding:10px 24px;border-radius:14px;
    background:rgba(15,23,42,0.6);border:1.5px solid;
    font-size:15px;font-weight:600;text-align:center;
    backdrop-filter:blur(8px);transition:color 0.3s ease,border-color 0.3s ease;
    animation:ng-slide-up 0.3s ease;max-width:360px;width:100%;
  }

  /* thermometer */
  .ng-thermo-wrap {
    position:relative;z-index:1;display:flex;align-items:center;gap:10px;width:100%;max-width:340px;
  }
  .ng-thermo-label { font-size:18px; }
  .ng-thermo {
    flex:1;height:10px;border-radius:99px;
    background:rgba(139,92,246,0.12);overflow:hidden;
  }
  .ng-thermo-fill { height:100%;border-radius:99px;transition:width 0.5s cubic-bezier(0.4,0,0.2,1),background 0.4s ease,box-shadow 0.4s ease; }

  /* input row */
  .ng-input-row {
    position:relative;z-index:1;display:flex;gap:10px;width:100%;max-width:340px;
    animation:ng-slide-up 0.3s ease;
  }
  .ng-shake { animation:ng-shake 0.45s ease; }
  .ng-input {
    flex:1;padding:13px 18px;border-radius:14px;
    background:rgba(15,23,42,0.7);border:2px solid rgba(139,92,246,0.3);
    color:#f1f5f9;font-size:18px;font-weight:700;text-align:center;
    outline:none;backdrop-filter:blur(8px);
    transition:border-color 0.2s ease,box-shadow 0.2s ease;
  }
  .ng-input:focus { border-color:#8b5cf6;box-shadow:0 0 0 3px rgba(139,92,246,0.2); }
  .ng-input::-webkit-inner-spin-button,.ng-input::-webkit-outer-spin-button { -webkit-appearance:none; }
  .ng-btn {
    padding:13px 22px;border-radius:14px;
    background:linear-gradient(135deg,#8b5cf6,#06b6d4);
    border:none;color:#fff;font-size:16px;font-weight:800;
    cursor:pointer;
    box-shadow:0 6px 18px rgba(139,92,246,0.4);
    transition:all 0.22s ease;white-space:nowrap;
  }
  .ng-btn:hover { transform:translateY(-3px);box-shadow:0 10px 26px rgba(139,92,246,0.55); }
  .ng-btn:active{ transform:translateY(0); }

  /* end card */
  .ng-endcard {
    position:relative;z-index:1;
    padding:14px 32px;border-radius:99px;
    border:2px solid var(--ec);color:var(--ec);
    background:rgba(15,23,42,0.7);
    font-size:18px;font-weight:800;
    box-shadow:0 0 24px var(--ec);backdrop-filter:blur(8px);
    animation:ng-endcard-in 0.45s cubic-bezier(0.34,1.56,0.64,1);
  }

  /* history */
  .ng-history {
    position:relative;z-index:1;display:flex;align-items:flex-end;gap:6px;
    padding:8px 12px;border-radius:16px;
    background:rgba(15,23,42,0.55);border:1px solid rgba(139,92,246,0.15);
    backdrop-filter:blur(8px);
  }
  .ng-hist-item { display:flex;flex-direction:column;align-items:center;gap:3px; }
  .ng-hist-bar-wrap { height:60px;display:flex;align-items:flex-end; }
  .ng-hist-bar { width:22px;border-radius:6px 6px 2px 2px;transition:height 0.3s ease; }
  .ng-hist-num { font-size:11px;font-weight:700; }
  .ng-hist-hint { font-size:10px;color:#64748b; }

  /* actions */
  .ng-actions { position:relative;z-index:1;display:flex;gap:10px; }
  .ng-ghost-btn {
    padding:9px 20px;border-radius:12px;
    background:rgba(30,27,75,0.6);border:1.5px solid rgba(139,92,246,0.3);
    color:#94a3b8;font-size:13px;font-weight:600;cursor:pointer;
    transition:all 0.2s ease;
  }
  .ng-ghost-btn:hover { background:rgba(139,92,246,0.15);color:#f1f5f9;transform:translateY(-2px); }
`
