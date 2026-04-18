import { useState, useEffect, useRef } from 'react'

const randomColor = () => {
  const r = Math.floor(Math.random() * 256)
  const g = Math.floor(Math.random() * 256)
  const b = Math.floor(Math.random() * 256)
  return { r, g, b, rgb: `rgb(${r},${g},${b})`, hex: `RGB(${r}, ${g}, ${b})` }
}

const generateOptions = (correct) => {
  const opts = [correct.hex]
  while (opts.length < 6) {
    const c = randomColor()
    if (!opts.includes(c.hex)) opts.push(c.hex)
  }
  return opts.sort(() => Math.random() - 0.5)
}

export default function ColorGuessing() {
  const [score, setScore]       = useState(0)
  const [streak, setStreak]     = useState(0)
  const [best, setBest]         = useState(0)
  const [color, setColor]       = useState(null)
  const [options, setOptions]   = useState([])
  const [answered, setAnswered] = useState(false)
  const [selected, setSelected] = useState(null)
  const [phase, setPhase]       = useState('idle') // idle | correct | wrong
  const [prevColor, setPrev]    = useState(null)
  const swatchRef               = useRef(null)

  const init = () => {
    const c = randomColor()
    setColor(c)
    setOptions(generateOptions(c))
    setAnswered(false)
    setSelected(null)
    setPhase('idle')
  }

  useEffect(() => { init() }, [])

  const handleSelect = (opt) => {
    if (answered) return
    setAnswered(true)
    setSelected(opt)
    const correct = opt === color.hex
    setPhase(correct ? 'correct' : 'wrong')
    if (correct) {
      const ns = streak + 1
      setScore(s => s + 1)
      setStreak(ns)
      setBest(b => Math.max(b, ns))
    } else {
      setStreak(0)
    }
    setTimeout(init, 1400)
  }

  const swatchStyle = color ? {
    background: color.rgb,
    boxShadow: `0 20px 60px ${color.rgb}88, 0 0 0 4px rgba(255,255,255,0.08)`,
  } : {}

  return (
    <>
      <style>{CG_STYLES}</style>
      <div className="cg-root">
        <div className="cg-orb cg-orb-1" style={color ? { background: color.rgb } : {}} />
        <div className="cg-orb cg-orb-2" />

        {/* Stats */}
        <div className="cg-stats">
          <Chip label="Score"  value={score}  color="#a78bfa" />
          <Chip label="Streak" value={streak} color="#fbbf24" />
          <Chip label="Best"   value={best}   color="#4ade80" />
        </div>

        {/* color swatch */}
        {color && (
          <div
            ref={swatchRef}
            className={`cg-swatch ${phase === 'correct' ? 'cg-swatch--correct' : phase === 'wrong' ? 'cg-swatch--wrong' : ''}`}
            style={swatchStyle}
          >
            {phase === 'correct' && <span className="cg-swatch-icon">✓</span>}
            {phase === 'wrong'   && <span className="cg-swatch-icon">✗</span>}
          </div>
        )}

        {/* prompt */}
        <div className="cg-prompt">Which RGB value matches this color?</div>

        {/* options grid */}
        <div className="cg-options">
          {options.map((opt, i) => {
            let state = 'idle'
            if (answered) {
              if (opt === color.hex)                          state = 'correct'
              else if (opt === selected && phase === 'wrong') state = 'wrong'
              else                                            state = 'dim'
            }
            return (
              <button
                key={i}
                className={`cg-opt cg-opt--${state}`}
                onClick={() => handleSelect(opt)}
                disabled={answered}
              >
                {opt}
              </button>
            )
          })}
        </div>

        <button className="cg-skip" onClick={init}>Skip →</button>
      </div>
    </>
  )
}

function Chip({ label, value, color }) {
  return (
    <div className="cg-chip" style={{ '--cc': color }}>
      <span className="cg-chip-label">{label}</span>
      <span className="cg-chip-val">{value}</span>
    </div>
  )
}

const CG_STYLES = `
  @keyframes cg-orb { 0%,100%{transform:translate(0,0)} 40%{transform:translate(20px,-15px)} 70%{transform:translate(-12px,8px)} }
  @keyframes cg-swatch-in { from{transform:scale(0.9);opacity:0} to{transform:scale(1);opacity:1} }
  @keyframes cg-correct-flash { 0%,100%{box-shadow:var(--sw)} 50%{box-shadow:0 0 50px 20px rgba(74,222,128,0.6)} }
  @keyframes cg-wrong-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
  @keyframes cg-slide-up { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

  .cg-root { position:relative;display:flex;flex-direction:column;align-items:center;gap:16px;padding:24px 16px 32px;overflow:hidden;min-height:520px; }
  .cg-orb { position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;z-index:0;animation:cg-orb 9s ease-in-out infinite; }
  .cg-orb-1 { width:280px;height:280px;opacity:0.18;top:-60px;left:-60px;transition:background 0.6s ease; }
  .cg-orb-2 { width:200px;height:200px;background:rgba(6,182,212,0.12);bottom:-40px;right:-40px;animation-delay:-4s; }

  .cg-stats { position:relative;z-index:1;display:flex;gap:10px;animation:cg-slide-up 0.4s ease; }
  .cg-chip { display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 16px;border-radius:14px;background:rgba(15,23,42,0.65);border:1px solid rgba(139,92,246,0.2);backdrop-filter:blur(10px); }
  .cg-chip-label { font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b; }
  .cg-chip-val { font-size:22px;font-weight:800;color:var(--cc); }

  .cg-swatch {
    position:relative;z-index:1;
    width:100%;max-width:400px;height:180px;border-radius:24px;
    display:flex;align-items:center;justify-content:center;
    animation:cg-swatch-in 0.4s ease;
    transition:box-shadow 0.4s ease;
    border:3px solid rgba(255,255,255,0.1);
  }
  .cg-swatch--correct { animation:cg-correct-flash 0.6s ease; }
  .cg-swatch--wrong { animation:cg-wrong-shake 0.5s ease; }
  .cg-swatch-icon { font-size:64px;color:rgba(255,255,255,0.9);text-shadow:0 4px 16px rgba(0,0,0,0.4); }

  .cg-prompt { position:relative;z-index:1;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px; }

  .cg-options {
    position:relative;z-index:1;
    display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;
    width:100%;max-width:440px;
  }
  .cg-opt {
    padding:14px 10px;border-radius:14px;
    font-family:monospace;font-size:13px;font-weight:600;
    border:2px solid rgba(139,92,246,0.25);
    background:rgba(15,23,42,0.65);color:#94a3b8;
    cursor:pointer;transition:all 0.2s ease;backdrop-filter:blur(8px);
  }
  .cg-opt:hover:not(:disabled) { border-color:#8b5cf6;color:#f1f5f9;transform:translateY(-2px);box-shadow:0 6px 18px rgba(139,92,246,0.25); }
  .cg-opt--correct { border-color:#4ade80 !important;background:rgba(74,222,128,0.15) !important;color:#4ade80 !important; }
  .cg-opt--wrong   { border-color:#f87171 !important;background:rgba(248,113,113,0.15) !important;color:#f87171 !important; }
  .cg-opt--dim { opacity:0.3; }
  .cg-opt:disabled { cursor:default; }

  .cg-skip { position:relative;z-index:1;padding:8px 20px;border-radius:10px;background:transparent;border:1.5px solid rgba(139,92,246,0.3);color:#64748b;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s ease; }
  .cg-skip:hover { color:#94a3b8;border-color:rgba(139,92,246,0.6); }
`
