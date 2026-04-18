import { useState, useEffect, useRef } from 'react'

const TEXTS = [
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.",
  "A journey of a thousand miles begins with a single step. Success is not final failure is not fatal.",
  "The only way to do great work is to love what you do. Stay hungry stay foolish and keep learning.",
  "Life is what happens when you are busy making other plans. The future belongs to those who believe.",
  "Code is like humor. When you have to explain it it is bad. First solve the problem then write code.",
]

export default function TypingTest() {
  const [text, setText]         = useState('')
  const [input, setInput]       = useState('')
  const [started, setStarted]   = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [wpm, setWpm]           = useState(0)
  const [accuracy, setAcc]      = useState(100)
  const [done, setDone]         = useState(false)
  const [startTime, setStart]   = useState(null)
  const [bestWpm, setBest]      = useState(0)
  const timerRef  = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => { setText(TEXTS[Math.floor(Math.random() * TEXTS.length)]) }, [])

  useEffect(() => {
    if (!started || timeLeft <= 0) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); endTest(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [started])

  const startTest = () => {
    const t = TEXTS[Math.floor(Math.random() * TEXTS.length)]
    setText(t)
    setInput('')
    setStarted(true)
    setTimeLeft(60)
    setWpm(0)
    setAcc(100)
    setDone(false)
    setStart(Date.now())
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const endTest = () => {
    setStarted(false)
    setDone(true)
    clearInterval(timerRef.current)
    setBest(b => Math.max(b, wpm))
  }

  const onInput = (e) => {
    if (!started) return
    const val = e.target.value
    setInput(val)
    let correct = 0
    for (let i = 0; i < val.length; i++) {
      if (val[i] === text[i]) correct++
    }
    const mins = (Date.now() - startTime) / 60000
    setWpm(mins > 0 ? Math.round((correct / 5) / mins) : 0)
    setAcc(val.length > 0 ? Math.round((correct / val.length) * 100) : 100)
    if (val.length >= text.length && correct === text.length) endTest()
  }

  const timerPct = (timeLeft / 60) * 100
  const timerColor = timeLeft > 30 ? '#4ade80' : timeLeft > 10 ? '#fbbf24' : '#f87171'

  return (
    <>
      <style>{TT_STYLES}</style>
      <div className="tt-root">
        <div className="tt-orb tt-orb-1" /><div className="tt-orb tt-orb-2" />

        {/* stats */}
        <div className="tt-stats">
          <StatCard label="Time" value={timeLeft} suffix="s" color={timerColor} />
          <StatCard label="WPM"  value={wpm}      suffix=""  color="#a78bfa" />
          <StatCard label="Acc"  value={accuracy} suffix="%" color={accuracy >= 95 ? '#4ade80' : accuracy >= 80 ? '#fbbf24' : '#f87171'} />
          <StatCard label="Best" value={bestWpm}  suffix=" WPM" color="#60a5fa" />
        </div>

        {/* timer bar */}
        <div className="tt-timer-wrap">
          <div className="tt-timer-bar" style={{ width: `${timerPct}%`, background: timerColor }} />
        </div>

        {/* text display */}
        <div className="tt-text-box">
          {text.split('').map((ch, i) => {
            let cls = 'tt-ch'
            if (i < input.length) cls += input[i] === ch ? ' tt-ch--ok' : ' tt-ch--err'
            else if (i === input.length && started) cls += ' tt-ch--cursor'
            return <span key={i} className={cls}>{ch}</span>
          })}
        </div>

        {/* input */}
        <textarea
          ref={inputRef}
          className="tt-input"
          value={input}
          onChange={onInput}
          disabled={!started}
          placeholder={started ? '' : 'Click Start Test to begin…'}
          rows={3}
          onPaste={e => e.preventDefault()}
        />

        {/* result banner */}
        {done && (
          <div className="tt-result">
            <span className="tt-result-main">{wpm} WPM</span>
            <span className="tt-result-sub">{accuracy}% accuracy {wpm >= bestWpm && bestWpm > 0 ? '🏆 New best!' : ''}</span>
          </div>
        )}

        <div className="tt-btns">
          <button className="tt-btn tt-btn--primary" onClick={startTest} disabled={started}>
            {done ? '🔄 Try Again' : '▶ Start Test'}
          </button>
        </div>
      </div>
    </>
  )
}

function StatCard({ label, value, suffix, color }) {
  return (
    <div className="tt-stat" style={{ '--bc': color }}>
      <span className="tt-stat-label">{label}</span>
      <span className="tt-stat-val">{value}{suffix}</span>
    </div>
  )
}

const TT_STYLES = `
  @keyframes tt-orb { 0%,100%{transform:translate(0,0)} 40%{transform:translate(20px,-15px)} 70%{transform:translate(-12px,8px)} }
  @keyframes tt-cursor { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes tt-result-in { from{opacity:0;transform:scale(0.9) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes tt-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  .tt-root { position:relative;display:flex;flex-direction:column;align-items:center;gap:14px;padding:24px 16px 32px;overflow:hidden; }
  .tt-orb { position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none;z-index:0;animation:tt-orb 9s ease-in-out infinite; }
  .tt-orb-1 { width:240px;height:240px;background:rgba(139,92,246,0.12);top:-50px;left:-40px; }
  .tt-orb-2 { width:200px;height:200px;background:rgba(6,182,212,0.1);bottom:-40px;right:-40px;animation-delay:-4s; }

  .tt-stats { position:relative;z-index:1;display:flex;gap:8px;flex-wrap:wrap;justify-content:center;animation:tt-in 0.4s ease; }
  .tt-stat { display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 14px;border-radius:14px;background:rgba(15,23,42,0.65);border:1px solid rgba(139,92,246,0.22);backdrop-filter:blur(10px); }
  .tt-stat-label { font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b; }
  .tt-stat-val { font-size:20px;font-weight:800;color:var(--bc); }

  .tt-timer-wrap { position:relative;z-index:1;width:100%;max-width:520px;height:6px;border-radius:6px;background:rgba(255,255,255,0.07); }
  .tt-timer-bar { height:100%;border-radius:6px;transition:width 1s linear, background 0.4s ease;box-shadow:0 0 8px currentColor; }

  .tt-text-box { position:relative;z-index:1;width:100%;max-width:520px;padding:20px 22px;border-radius:20px;background:rgba(15,23,42,0.72);border:1.5px solid rgba(139,92,246,0.22);backdrop-filter:blur(14px);font-family:'JetBrains Mono',monospace;font-size:16px;line-height:1.8;letter-spacing:0.02em; }
  .tt-ch { color:#475569; }
  .tt-ch--ok { color:#4ade80; }
  .tt-ch--err { color:#f87171;background:rgba(248,113,113,0.15);border-radius:2px; }
  .tt-ch--cursor { background:#8b5cf6;color:#fff;border-radius:2px;animation:tt-cursor 1s ease-in-out infinite; }

  .tt-input { position:relative;z-index:1;width:100%;max-width:520px;padding:14px 18px;border-radius:16px;background:rgba(15,23,42,0.65);border:2px solid rgba(139,92,246,0.3);color:#f1f5f9;font-size:15px;font-family:'JetBrains Mono',monospace;resize:none;outline:none;transition:border-color 0.2s; }
  .tt-input:focus { border-color:#8b5cf6; }
  .tt-input:disabled { opacity:0.4;cursor:not-allowed; }

  .tt-result { position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:16px 32px;border-radius:20px;background:linear-gradient(135deg,rgba(139,92,246,0.18),rgba(6,182,212,0.18));border:1.5px solid rgba(139,92,246,0.4);animation:tt-result-in 0.4s cubic-bezier(0.34,1.2,0.64,1); }
  .tt-result-main { font-size:32px;font-weight:900;background:linear-gradient(135deg,#a78bfa,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent; }
  .tt-result-sub { font-size:13px;color:#94a3b8; }

  .tt-btns { position:relative;z-index:1;display:flex;gap:10px; }
  .tt-btn { padding:12px 28px;border-radius:14px;border:none;font-size:15px;font-weight:700;cursor:pointer;transition:all 0.25s ease; }
  .tt-btn--primary { background:linear-gradient(135deg,#8b5cf6,#06b6d4);color:#fff;box-shadow:0 6px 18px rgba(139,92,246,0.4); }
  .tt-btn--primary:hover:not(:disabled) { transform:translateY(-3px);box-shadow:0 10px 26px rgba(139,92,246,0.55); }
  .tt-btn:disabled { opacity:0.4;cursor:not-allowed;transform:none; }
`
