import { useState, useEffect, useRef } from 'react'

export default function MathQuiz() {
  const [score, setScore]     = useState(0)
  const [streak, setStreak]   = useState(0)
  const [best, setBest]       = useState(0)
  const [time, setTime]       = useState(0)
  const [qs, setQs]           = useState('')
  const [ans, setAns]         = useState(0)
  const [input, setInput]     = useState('')
  const [phase, setPhase]     = useState('idle')  // idle | correct | wrong
  const [shaking, setShaking] = useState(false)
  const inputRef = useRef(null)

  const ri = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

  const nextQ = () => {
    const ops = ['+','-','×','÷']
    const op  = ops[ri(0,3)]
    let a, b, answer
    switch (op) {
      case '+': a=ri(1,99);b=ri(1,99);answer=a+b;break
      case '-': a=ri(10,99);b=ri(1,a);answer=a-b;break
      case '×': a=ri(1,12);b=ri(1,12);answer=a*b;break
      case '÷': b=ri(1,12);answer=ri(1,12);a=b*answer;break
      default:  a=1;b=1;answer=2
    }
    setQs(`${a} ${op} ${b}`)
    setAns(answer)
    setInput('')
    setPhase('idle')
    setTimeout(() => inputRef.current?.focus(), 10)
  }

  useEffect(() => { nextQ() }, [])
  useEffect(() => {
    const t = setInterval(() => setTime(n => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const submit = () => {
    if (phase !== 'idle') return
    const n = parseInt(input)
    if (isNaN(n)) return
    if (n === ans) {
      setScore(s => s + 1)
      const ns = streak + 1
      setStreak(ns)
      setBest(b => Math.max(b, ns))
      setPhase('correct')
      setTimeout(nextQ, 900)
    } else {
      setStreak(0)
      setPhase('wrong')
      setShaking(true)
      setTimeout(() => setShaking(false), 400)
      setTimeout(nextQ, 1200)
    }
  }

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  return (
    <>
      <style>{MQ_STYLES}</style>
      <div className="mq-root">
        <div className="mq-orb mq-orb-1" /><div className="mq-orb mq-orb-2" />

        {/* stats */}
        <div className="mq-stats">
          <SC label="Score"  value={score}  color="#4ade80" />
          <SC label="Streak" value={streak} color="#fbbf24" badge={streak >= 3 ? '🔥' : null} />
          <SC label="Best"   value={best}   color="#a78bfa" />
          <SC label="Time"   value={fmt(time)} color="#60a5fa" />
        </div>

        {/* question card */}
        <div className={`mq-question ${phase==='correct'?'mq-question--ok':phase==='wrong'?'mq-question--err':''}`}>
          <span className="mq-q-text">{qs} = ?</span>
          {phase === 'correct' && <div className="mq-feedback mq-feedback--ok">✓ Correct!</div>}
          {phase === 'wrong'   && <div className="mq-feedback mq-feedback--err">✗ Answer: {ans}</div>}
        </div>

        {/* input */}
        <div className={`mq-input-wrap ${shaking ? 'mq-shake' : ''}`}>
          <input
            ref={inputRef}
            type="number"
            className="mq-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="?"
            disabled={phase !== 'idle'}
          />
        </div>

        {/* streak flames */}
        {streak >= 3 && (
          <div className="mq-streak-bar">
            {'🔥'.repeat(Math.min(streak, 10))}
            <span className="mq-streak-txt">{streak} streak!</span>
          </div>
        )}

        <div className="mq-btns">
          <button className="mq-btn mq-btn--primary" onClick={submit} disabled={phase !== 'idle'}>
            ✓ Submit
          </button>
          <button className="mq-btn mq-btn--ghost" onClick={nextQ}>
            → Skip
          </button>
        </div>
      </div>
    </>
  )
}

function SC({ label, value, color, badge }) {
  return (
    <div className="mq-chip" style={{ '--cc': color }}>
      <span className="mq-chip-label">{label}</span>
      <span className="mq-chip-val">{badge && <span>{badge}</span>}{value}</span>
    </div>
  )
}

const MQ_STYLES = `
  @keyframes mq-orb { 0%,100%{transform:translate(0,0)} 40%{transform:translate(20px,-15px)} 70%{transform:translate(-12px,8px)} }
  @keyframes mq-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
  @keyframes mq-ok { from{transform:scale(0.9)} to{transform:scale(1)} }
  @keyframes mq-streak { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
  @keyframes mq-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  .mq-root { position:relative;display:flex;flex-direction:column;align-items:center;gap:14px;padding:24px 16px 32px;overflow:hidden;min-height:420px; }
  .mq-orb { position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none;z-index:0;animation:mq-orb 9s ease-in-out infinite; }
  .mq-orb-1 { width:240px;height:240px;background:rgba(74,222,128,0.1);top:-50px;left:-40px; }
  .mq-orb-2 { width:200px;height:200px;background:rgba(251,191,36,0.1);bottom:-40px;right:-40px;animation-delay:-4s; }

  .mq-stats { position:relative;z-index:1;display:flex;gap:8px;flex-wrap:wrap;justify-content:center;animation:mq-in 0.4s ease; }
  .mq-chip { display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 14px;border-radius:14px;background:rgba(15,23,42,0.65);border:1px solid rgba(139,92,246,0.22);backdrop-filter:blur(10px); }
  .mq-chip-label { font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b; }
  .mq-chip-val { font-size:18px;font-weight:800;color:var(--cc);display:flex;align-items:center;gap:3px; }

  .mq-question {
    position:relative;z-index:1;
    display:flex;flex-direction:column;align-items:center;gap:8px;
    padding:28px 36px;border-radius:24px;
    background:rgba(15,23,42,0.7);border:2px solid rgba(139,92,246,0.25);
    backdrop-filter:blur(14px);min-width:240px;text-align:center;
    transition:border-color 0.25s ease, box-shadow 0.25s ease;
  }
  .mq-question--ok  { border-color:#4ade80;box-shadow:0 0 30px rgba(74,222,128,0.2);animation:mq-ok 0.3s ease; }
  .mq-question--err { border-color:#f87171;box-shadow:0 0 30px rgba(248,113,113,0.2); }
  .mq-q-text { font-size:42px;font-weight:900;background:linear-gradient(135deg,#a78bfa,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent; }
  .mq-feedback { font-size:15px;font-weight:700; }
  .mq-feedback--ok  { color:#4ade80; }
  .mq-feedback--err { color:#f87171; }

  .mq-input-wrap { position:relative;z-index:1; }
  .mq-shake { animation:mq-shake 0.4s ease; }
  .mq-input { width:140px;height:70px;text-align:center;font-size:36px;font-weight:900;border-radius:18px;background:rgba(15,23,42,0.7);border:2px solid rgba(139,92,246,0.3);color:#f1f5f9;outline:none;transition:border-color 0.2s;-moz-appearance:textfield; }
  .mq-input::-webkit-outer-spin-button,.mq-input::-webkit-inner-spin-button{-webkit-appearance:none}
  .mq-input:focus { border-color:#8b5cf6; }
  .mq-input:disabled { opacity:0.5;cursor:not-allowed; }

  .mq-streak-bar { position:relative;z-index:1;display:flex;align-items:center;gap:6px;padding:6px 16px;border-radius:20px;background:rgba(251,191,36,0.12);border:1px solid rgba(251,191,36,0.3);animation:mq-streak 0.35s ease; }
  .mq-streak-txt { font-size:14px;font-weight:700;color:#fbbf24; }

  .mq-btns { position:relative;z-index:1;display:flex;gap:10px; }
  .mq-btn { padding:12px 24px;border-radius:14px;font-size:15px;font-weight:700;cursor:pointer;transition:all 0.25s ease;border:none; }
  .mq-btn--primary { background:linear-gradient(135deg,#8b5cf6,#06b6d4);color:#fff;box-shadow:0 6px 18px rgba(139,92,246,0.4); }
  .mq-btn--primary:hover:not(:disabled) { transform:translateY(-3px);box-shadow:0 10px 26px rgba(139,92,246,0.55); }
  .mq-btn--ghost { background:rgba(15,23,42,0.6);border:1.5px solid rgba(139,92,246,0.3);color:#94a3b8; }
  .mq-btn--ghost:hover { border-color:rgba(139,92,246,0.6);color:#f1f5f9; }
  .mq-btn:disabled { opacity:0.4;cursor:not-allowed;transform:none; }
`
