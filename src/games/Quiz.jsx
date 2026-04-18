import { useState, useEffect, useRef } from 'react'

const QUESTIONS = [
  { question: "What is the capital of France?", options: ["London","Berlin","Paris","Madrid"], correct: 2 },
  { question: "Which planet is known as the Red Planet?", options: ["Venus","Mars","Jupiter","Saturn"], correct: 1 },
  { question: "Who painted the Mona Lisa?", options: ["Van Gogh","Picasso","Da Vinci","Michelangelo"], correct: 2 },
  { question: "What is the largest ocean on Earth?", options: ["Atlantic","Indian","Arctic","Pacific"], correct: 3 },
  { question: "In which year did World War II end?", options: ["1943","1944","1945","1946"], correct: 2 },
  { question: "What is the smallest country in the world?", options: ["Monaco","Vatican City","San Marino","Liechtenstein"], correct: 1 },
  { question: "How many continents are there?", options: ["5","6","7","8"], correct: 2 },
  { question: "What is the chemical symbol for gold?", options: ["Go","Gd","Au","Ag"], correct: 2 },
  { question: "Who wrote 'Romeo and Juliet'?", options: ["Dickens","Shakespeare","Austen","Twain"], correct: 1 },
  { question: "What is the fastest land animal?", options: ["Lion","Cheetah","Leopard","Tiger"], correct: 1 },
  { question: "What is the tallest mountain in the world?", options: ["K2","Kangchenjunga","Mount Everest","Lhotse"], correct: 2 },
  { question: "Which element has atomic number 1?", options: ["Helium","Hydrogen","Oxygen","Carbon"], correct: 1 },
  { question: "How many sides does a hexagon have?", options: ["5","6","7","8"], correct: 1 },
  { question: "What is the largest mammal in the world?", options: ["Elephant","Blue Whale","Giraffe","Polar Bear"], correct: 1 },
  { question: "Great Pyramid of Giza is in which country?", options: ["Mexico","Greece","Egypt","Iraq"], correct: 2 },
]

const TIMER = 15

export default function Quiz() {
  const [state, setState]       = useState('start')
  const [questions, setQuestions] = useState([])
  const [idx, setIdx]           = useState(0)
  const [score, setScore]       = useState(0)
  const [selected, setSelected] = useState(null)
  const [timeLeft, setTimeLeft] = useState(TIMER)
  const timerRef = useRef(null)

  const startQuiz = () => {
    const q = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10)
    setQuestions(q)
    setIdx(0)
    setScore(0)
    setSelected(null)
    setTimeLeft(TIMER)
    setState('playing')
  }

  useEffect(() => {
    if (state !== 'playing' || selected !== null) {
      clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          setSelected(-1) // timed out
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [state, idx, selected])

  const pick = (i) => {
    if (selected !== null) return
    clearInterval(timerRef.current)
    setSelected(i)
    if (i === questions[idx].correct) setScore(s => s + 1)
  }

  const next = () => {
    const nextIdx = idx + 1
    if (nextIdx < questions.length) {
      setIdx(nextIdx)
      setSelected(null)
      setTimeLeft(TIMER)
    } else {
      setState('result')
    }
  }

  const pct = score / (questions.length || 1) * 100
  const medal = pct === 100 ? '🏆' : pct >= 80 ? '🥇' : pct >= 60 ? '🥈' : pct >= 40 ? '🥉' : '🎯'

  if (state === 'start') return (
    <>
      <style>{QZ_STYLES}</style>
      <div className="qz-root">
        <div className="qz-orb qz-orb-1" /><div className="qz-orb qz-orb-2" />
        <div className="qz-start-card">
          <div className="qz-big-icon">🧠</div>
          <h2 className="qz-start-title">General Knowledge Quiz</h2>
          <p className="qz-start-sub">10 questions · 15 seconds each · Score as high as you can!</p>
          <button className="qz-btn qz-btn--primary" onClick={startQuiz}>🚀 Start Quiz</button>
        </div>
      </div>
    </>
  )

  if (state === 'result') return (
    <>
      <style>{QZ_STYLES}</style>
      <div className="qz-root">
        <div className="qz-orb qz-orb-1" /><div className="qz-orb qz-orb-2" />
        <div className="qz-result-card">
          <div className="qz-result-icon">{medal}</div>
          <div className="qz-result-score">{score}<span>/{questions.length}</span></div>
          <div className="qz-result-pct" style={{ color: pct >= 60 ? '#4ade80' : '#f87171' }}>{Math.round(pct)}%</div>
          <div className="qz-result-bar"><div className="qz-result-fill" style={{ width: `${pct}%`, background: pct >= 60 ? '#4ade80' : '#f87171' }} /></div>
          <p className="qz-result-msg">
            {pct === 100 ? 'Perfect score! Genius!' : pct >= 80 ? 'Excellent work!' : pct >= 60 ? 'Good job!' : 'Keep learning!'}
          </p>
          <button className="qz-btn qz-btn--primary" onClick={startQuiz}>🔄 Play Again</button>
        </div>
      </div>
    </>
  )

  const q = questions[idx]
  const timerPct = (timeLeft / TIMER) * 100
  const timerColor = timeLeft > 8 ? '#4ade80' : timeLeft > 4 ? '#fbbf24' : '#f87171'

  return (
    <>
      <style>{QZ_STYLES}</style>
      <div className="qz-root">
        <div className="qz-orb qz-orb-1" /><div className="qz-orb qz-orb-2" />

        {/* header */}
        <div className="qz-header">
          <span className="qz-q-count">Q {idx + 1} / {questions.length}</span>
          <div className="qz-score-badge">⭐ {score}</div>
        </div>

        {/* timer bar */}
        <div className="qz-timer-wrap">
          <div className="qz-timer-bar" style={{ width: `${timerPct}%`, background: timerColor, boxShadow: `0 0 8px ${timerColor}88` }} />
          <span className="qz-timer-num" style={{ color: timerColor }}>{timeLeft}s</span>
        </div>

        {/* question */}
        <div className="qz-question-card">
          <p className="qz-question-text">{q.question}</p>
        </div>

        {/* options */}
        <div className="qz-options">
          {q.options.map((opt, i) => {
            let st = 'idle'
            if (selected !== null) {
              if (i === q.correct) st = 'correct'
              else if (i === selected) st = 'wrong'
              else st = 'dim'
            }
            return (
              <button
                key={i}
                className={`qz-opt qz-opt--${st}`}
                onClick={() => pick(i)}
                disabled={selected !== null}
              >
                <span className="qz-opt-letter">{['A','B','C','D'][i]}</span>
                <span>{opt}</span>
                {st === 'correct' && <span className="qz-opt-badge">✓</span>}
                {st === 'wrong'   && <span className="qz-opt-badge">✗</span>}
              </button>
            )
          })}
        </div>

        {selected !== null && (
          <button className="qz-btn qz-btn--primary" onClick={next}>
            {idx + 1 < questions.length ? 'Next Question →' : 'View Results 🏆'}
          </button>
        )}
      </div>
    </>
  )
}

const QZ_STYLES = `
  @keyframes qz-orb { 0%,100%{transform:translate(0,0)} 40%{transform:translate(20px,-15px)} 70%{transform:translate(-12px,8px)} }
  @keyframes qz-in { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes qz-pop { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }

  .qz-root { position:relative;display:flex;flex-direction:column;align-items:center;gap:14px;padding:24px 16px 32px;overflow:hidden;min-height:540px; }
  .qz-orb { position:absolute;border-radius:50%;filter:blur(72px);pointer-events:none;z-index:0;animation:qz-orb 9s ease-in-out infinite; }
  .qz-orb-1 { width:240px;height:240px;background:rgba(139,92,246,0.12);top:-50px;left:-40px; }
  .qz-orb-2 { width:200px;height:200px;background:rgba(6,182,212,0.1);bottom:-40px;right:-40px;animation-delay:-4s; }

  .qz-header { position:relative;z-index:1;width:100%;max-width:480px;display:flex;justify-content:space-between;align-items:center;animation:qz-in 0.3s ease; }
  .qz-q-count { font-size:13px;color:#64748b;font-weight:600; }
  .qz-score-badge { padding:5px 14px;border-radius:20px;background:rgba(139,92,246,0.2);border:1px solid rgba(139,92,246,0.3);color:#a78bfa;font-weight:700; }

  .qz-timer-wrap { position:relative;z-index:1;width:100%;max-width:480px;height:8px;border-radius:8px;background:rgba(255,255,255,0.07);display:flex;align-items:center;gap:8px; }
  .qz-timer-bar { height:100%;border-radius:8px;transition:width 1s linear, background 0.4s ease;flex-shrink:0; }
  .qz-timer-num { font-size:12px;font-weight:700;flex-shrink:0;min-width:24px; }

  .qz-question-card { position:relative;z-index:1;width:100%;max-width:480px;padding:20px 24px;border-radius:20px;background:rgba(15,23,42,0.7);border:1.5px solid rgba(139,92,246,0.25);backdrop-filter:blur(14px);animation:qz-in 0.35s ease; }
  .qz-question-text { font-size:16px;font-weight:600;color:#f1f5f9;line-height:1.6;margin:0; }

  .qz-options { position:relative;z-index:1;width:100%;max-width:480px;display:flex;flex-direction:column;gap:10px; }
  .qz-opt { width:100%;padding:14px 18px;border-radius:14px;border:2px solid rgba(139,92,246,0.22);background:rgba(15,23,42,0.65);color:#94a3b8;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:12px;transition:all 0.2s ease;text-align:left;backdrop-filter:blur(8px); }
  .qz-opt:hover:not(:disabled) { border-color:#8b5cf6;color:#f1f5f9;transform:translateX(4px); }
  .qz-opt-letter { width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;background:rgba(139,92,246,0.2);color:#a78bfa;flex-shrink:0; }
  .qz-opt-badge { margin-left:auto;font-size:16px; }
  .qz-opt--correct { border-color:#4ade80 !important;background:rgba(74,222,128,0.12) !important;color:#4ade80 !important;animation:qz-pop 0.3s ease; }
  .qz-opt--correct .qz-opt-letter { background:rgba(74,222,128,0.2);color:#4ade80; }
  .qz-opt--wrong { border-color:#f87171 !important;background:rgba(248,113,113,0.12) !important;color:#f87171 !important; }
  .qz-opt--wrong .qz-opt-letter { background:rgba(248,113,113,0.2);color:#f87171; }
  .qz-opt--dim { opacity:0.35; }
  .qz-opt:disabled { cursor:default; }

  .qz-start-card, .qz-result-card { position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:16px;padding:36px 24px;border-radius:28px;background:rgba(15,23,42,0.75);border:1.5px solid rgba(139,92,246,0.25);backdrop-filter:blur(14px);max-width:420px;width:100%;animation:qz-pop 0.4s ease; }
  .qz-big-icon { font-size:64px; }
  .qz-start-title { font-size:22px;font-weight:800;color:#f1f5f9;margin:0;text-align:center; }
  .qz-start-sub { font-size:13px;color:#64748b;text-align:center;margin:0; }
  .qz-result-icon { font-size:72px; }
  .qz-result-score { font-size:52px;font-weight:900;color:#f1f5f9;line-height:1; }
  .qz-result-score span { font-size:28px;color:#64748b; }
  .qz-result-pct { font-size:20px;font-weight:700; }
  .qz-result-bar { width:100%;height:8px;border-radius:8px;background:rgba(255,255,255,0.07);overflow:hidden; }
  .qz-result-fill { height:100%;border-radius:8px;transition:width 0.8s ease; }
  .qz-result-msg { font-size:15px;color:#94a3b8;text-align:center;margin:0; }

  .qz-btn { position:relative;z-index:1;padding:13px 32px;border-radius:14px;border:none;color:#fff;font-size:16px;font-weight:700;cursor:pointer;transition:all 0.25s ease; }
  .qz-btn--primary { background:linear-gradient(135deg,#8b5cf6,#06b6d4);box-shadow:0 6px 18px rgba(139,92,246,0.4); }
  .qz-btn--primary:hover { transform:translateY(-3px);box-shadow:0 10px 26px rgba(139,92,246,0.55); }
`
