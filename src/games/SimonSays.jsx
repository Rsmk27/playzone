import { useState, useEffect, useCallback, useRef } from 'react'

const PADS = [
  { id: 0, label: 'Red',    color: '#f87171', glow: 'rgba(248,113,113,0.7)', dark: '#7f1d1d' },
  { id: 1, label: 'Green',  color: '#4ade80', glow: 'rgba(74,222,128,0.7)',  dark: '#14532d' },
  { id: 2, label: 'Blue',   color: '#60a5fa', glow: 'rgba(96,165,250,0.7)',  dark: '#1e3a5f' },
  { id: 3, label: 'Yellow', color: '#fbbf24', glow: 'rgba(251,191,36,0.7)', dark: '#713f12' },
]

export default function SimonSays() {
  const [sequence, setSequence]   = useState([])
  const [playerSeq, setPlayerSeq] = useState([])
  const [level, setLevel]         = useState(0)
  const [activeId, setActiveId]   = useState(null)
  const [phase, setPhase]         = useState('idle')  // idle | watching | input | wrong | win
  const [bestLevel, setBest]      = useState(0)
  const [msg, setMsg]             = useState('Press Start to Play')
  const timeouts = useRef([])

  const clearT = () => { timeouts.current.forEach(clearTimeout); timeouts.current = [] }

  const flash = useCallback(async (seq) => {
    setPhase('watching')
    setMsg('Watch carefully…')
    for (let i = 0; i < seq.length; i++) {
      await new Promise(r => { const t = setTimeout(r, 500); timeouts.current.push(t) })
      setActiveId(seq[i])
      await new Promise(r => { const t = setTimeout(r, 550); timeouts.current.push(t) })
      setActiveId(null)
    }
    setPhase('input')
    setMsg('Your turn! Repeat the sequence.')
  }, [])

  const nextLevel = useCallback((prevSeq) => {
    const next = [...prevSeq, Math.floor(Math.random() * 4)]
    setSequence(next)
    setPlayerSeq([])
    setLevel(next.length)
    setBest(b => Math.max(b, next.length))
    setTimeout(() => flash(next), 600)
  }, [flash])

  const startGame = () => {
    clearT()
    setSequence([])
    setPlayerSeq([])
    setLevel(0)
    setPhase('idle')
    const first = [Math.floor(Math.random() * 4)]
    setSequence(first)
    setLevel(1)
    setTimeout(() => flash(first), 400)
  }

  const handlePad = (id) => {
    if (phase !== 'input') return
    setActiveId(id)
    setTimeout(() => setActiveId(null), 200)

    const newSeq = [...playerSeq, id]
    setPlayerSeq(newSeq)

    const idx = newSeq.length - 1
    if (newSeq[idx] !== sequence[idx]) {
      setPhase('wrong')
      setMsg(`❌ Game over! Reached level ${level}`)
      return
    }

    if (newSeq.length === sequence.length) {
      setMsg('✅ Correct! Next level…')
      setPhase('idle')
      setTimeout(() => nextLevel(sequence), 900)
    }
  }

  return (
    <>
      <style>{SS_STYLES}</style>
      <div className="ss-root">
        <div className="ss-orb ss-orb-1" />
        <div className="ss-orb ss-orb-2" />

        {/* header */}
        <div className="ss-header">
          <StatPill label="Level" value={level} color="#a78bfa" />
          <StatPill label="Best"  value={bestLevel} color="#4ade80" />
        </div>

        {/* message */}
        <div className="ss-msg">{msg}</div>

        {/* simon pads */}
        <div className="ss-pads">
          {PADS.map(pad => (
            <button
              key={pad.id}
              className="ss-pad"
              style={{
                '--pc': pad.color,
                '--pg': pad.glow,
                '--pd': pad.dark,
                background: activeId === pad.id ? pad.color : pad.dark,
                boxShadow: activeId === pad.id
                  ? `0 0 40px ${pad.glow}, inset 0 0 20px rgba(255,255,255,0.2)`
                  : `inset 0 0 20px rgba(0,0,0,0.3)`,
                transform: activeId === pad.id ? 'scale(0.94)' : 'scale(1)',
              }}
              onClick={() => handlePad(pad.id)}
              disabled={phase !== 'input'}
            >
              <span className="ss-pad-label">{pad.label}</span>
            </button>
          ))}
        </div>

        {/* sequence progress */}
        {phase === 'input' && sequence.length > 0 && (
          <div className="ss-progress">
            {sequence.map((_, i) => (
              <div
                key={i}
                className="ss-prog-dot"
                style={{ background: i < playerSeq.length ? '#4ade80' : 'rgba(255,255,255,0.15)' }}
              />
            ))}
          </div>
        )}

        <button
          className="ss-btn"
          onClick={startGame}
          disabled={phase === 'watching' || phase === 'input'}
        >
          {phase === 'idle' || phase === 'wrong' ? (level === 0 ? '🎮 Start Game' : '🔄 Restart') : '…'}
        </button>
      </div>
    </>
  )
}

function StatPill({ label, value, color }) {
  return (
    <div className="ss-pill" style={{ '--sc': color }}>
      <span className="ss-pill-label">{label}</span>
      <span className="ss-pill-val">{value}</span>
    </div>
  )
}

const SS_STYLES = `
  @keyframes ss-orb { 0%,100%{transform:translate(0,0)} 40%{transform:translate(22px,-16px)} 70%{transform:translate(-14px,10px)} }
  @keyframes ss-slide-up { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ss-msg-in { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }

  .ss-root { position:relative;display:flex;flex-direction:column;align-items:center;gap:16px;padding:24px 16px 32px;overflow:hidden;min-height:520px; }
  .ss-orb { position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none;z-index:0;animation:ss-orb 9s ease-in-out infinite; }
  .ss-orb-1 { width:240px;height:240px;background:rgba(248,113,113,0.1);top:-50px;left:-30px; }
  .ss-orb-2 { width:210px;height:210px;background:rgba(74,222,128,0.1);bottom:-40px;right:-30px;animation-delay:-4s; }

  .ss-header { position:relative;z-index:1;display:flex;gap:16px;animation:ss-slide-up 0.4s ease; }
  .ss-pill { display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 20px;border-radius:14px;background:rgba(15,23,42,0.65);border:1px solid rgba(139,92,246,0.22);backdrop-filter:blur(10px); }
  .ss-pill-label { font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b; }
  .ss-pill-val { font-size:28px;font-weight:800;color:var(--sc); }

  .ss-msg { position:relative;z-index:1;padding:10px 24px;border-radius:14px;background:rgba(15,23,42,0.6);border:1px solid rgba(139,92,246,0.2);font-size:14px;color:#94a3b8;text-align:center;backdrop-filter:blur(8px);animation:ss-msg-in 0.3s ease; }

  .ss-pads { position:relative;z-index:1;display:grid;grid-template-columns:repeat(2,1fr);gap:10px;width:min(300px,90vw); }
  .ss-pad {
    aspect-ratio:1;border-radius:20px;cursor:pointer;border:2px solid rgba(255,255,255,0.08);
    display:flex;align-items:center;justify-content:center;
    transition:all 0.12s ease;
  }
  .ss-pad:disabled { cursor:default; }
  .ss-pad-label { font-size:13px;font-weight:700;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.5px; }

  .ss-progress { position:relative;z-index:1;display:flex;gap:8px;align-items:center; }
  .ss-prog-dot { width:10px;height:10px;border-radius:50%;transition:background 0.3s ease; }

  .ss-btn { position:relative;z-index:1;padding:13px 32px;border-radius:14px;background:linear-gradient(135deg,#8b5cf6,#06b6d4);border:none;color:#fff;font-size:16px;font-weight:700;cursor:pointer;box-shadow:0 6px 18px rgba(139,92,246,0.4);transition:all 0.25s ease; }
  .ss-btn:hover:not(:disabled) { transform:translateY(-3px);box-shadow:0 10px 26px rgba(139,92,246,0.55); }
  .ss-btn:disabled { opacity:0.5;cursor:default;transform:none; }
`
