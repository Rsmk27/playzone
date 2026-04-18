import { useState, useEffect, useRef } from 'react'

const WORDS = [
  'JAVASCRIPT', 'PYTHON', 'REACT', 'VITE', 'CODING', 'PROGRAM', 'FUNCTION',
  'VARIABLE', 'CONSTANT', 'OBJECT', 'ARRAY', 'PROMISE', 'ASYNC', 'MODULE',
  'IMPORT', 'EXPORT', 'COMPONENT', 'STATE', 'EFFECT', 'RENDER'
]

export default function TypingAttack() {
  const [enemies, setEnemies]   = useState([])
  const [input, setInput]       = useState('')
  const [score, setScore]       = useState(0)
  const [lives, setLives]       = useState(3)
  const [phase, setPhase]       = useState('idle') // idle | playing | dead
  const [level, setLevel]       = useState(1)
  const [matched, setMatched]   = useState(null)
  const inputRef = useRef(null)
  const timerRef = useRef(null)
  const spawnRef = useRef(null)

  const getSpeed = (lv) => Math.max(8, 42 - lv * 4)
  const getInterval = (lv) => Math.max(1200, 3500 - lv * 250)

  const spawn = (lv) => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)]
    setEnemies(prev => {
      if (prev.some(e => e.word === word)) return prev
      return [...prev, {
        id: Date.now(),
        word,
        x: Math.random() * 75 + 2,
        y: 0,
        speed: getSpeed(lv),
      }]
    })
  }

  useEffect(() => {
    if (phase !== 'playing') return
    const tick = setInterval(() => {
      setEnemies(prev => {
        const newL = prev.map(e => ({ ...e, y: e.y + 1 }))
        const escaped = newL.filter(e => e.y >= 94)
        if (escaped.length > 0) {
          setLives(l => {
            const nl = l - escaped.length
            if (nl <= 0) setPhase('dead')
            return Math.max(0, nl)
          })
          return newL.filter(e => e.y < 94)
        }
        return newL
      })
      setScore(s => {
        const newLv = Math.floor(s / 100) + 1
        setLevel(newLv)
        return s
      })
    }, 100)
    timerRef.current = tick
    return () => clearInterval(tick)
  }, [phase])

  useEffect(() => {
    if (phase !== 'playing') return
    const iv = setInterval(() => {
      setLevel(lv => { spawn(lv); return lv })
    }, getInterval(level))
    spawnRef.current = iv
    return () => clearInterval(iv)
  }, [phase, level])

  useEffect(() => {
    if (phase === 'playing') inputRef.current?.focus()
    if (phase === 'dead') { clearInterval(timerRef.current); clearInterval(spawnRef.current) }
  }, [phase])

  const startGame = () => {
    setEnemies([])
    setInput('')
    setScore(0)
    setLives(3)
    setLevel(1)
    setPhase('playing')
    setMatched(null)
  }

  const handleInput = (e) => {
    const val = e.target.value.toUpperCase()
    setInput(val)
    const hit = enemies.find(en => en.word === val)
    if (hit) {
      setEnemies(prev => prev.filter(en => en.id !== hit.id))
      setScore(s => s + hit.word.length * 10)
      setMatched(hit.id)
      setTimeout(() => setMatched(null), 400)
      setInput('')
    }
  }

  return (
    <>
      <style>{TA_STYLES}</style>
      <div className="ta-root">
        <div className="ta-orb ta-orb-1"/><div className="ta-orb ta-orb-2"/>

        {/* stats */}
        <div className="ta-stats">
          <SC label="Score" value={score}  color="#a78bfa"/>
          <SC label="Level" value={level}  color="#4ade80"/>
          <div className="ta-lives">
            {Array(3).fill(null).map((_,i)=>(
              <span key={i} className={`ta-heart ${i<lives?'ta-heart--full':'ta-heart--empty'}`}>❤️</span>
            ))}
          </div>
        </div>

        {/* game area */}
        <div className="ta-arena">
          {phase !== 'playing' ? (
            <div className="ta-overlay">
              {phase === 'dead' ? (
                <>
                  <span className="ta-overlay-icon">💀</span>
                  <p className="ta-overlay-score">Score: <strong style={{color:'#a78bfa'}}>{score}</strong></p>
                  <button className="ta-btn" onClick={startGame}>🔄 Try Again</button>
                </>
              ) : (
                <>
                  <span className="ta-overlay-icon">⌨️</span>
                  <p className="ta-overlay-msg">Type the falling words to destroy them!</p>
                  <button className="ta-btn" onClick={startGame}>▶ Start Attack</button>
                </>
              )}
            </div>
          ) : enemies.map(en => {
            const typed = input.length > 0 && en.word.startsWith(input) ? input.length : 0
            return (
              <div
                key={en.id}
                className={`ta-enemy ${matched===en.id?'ta-enemy--hit':''}`}
                style={{ left:`${en.x}%`, top:`${en.y}%`, animationDuration:`${en.speed}s` }}
              >
                <span className="ta-e-word">
                  <span className="ta-e-typed">{en.word.slice(0,typed)}</span>
                  {en.word.slice(typed)}
                </span>
              </div>
            )
          })}
        </div>

        {/* input */}
        {phase === 'playing' && (
          <input
            ref={inputRef}
            className="ta-input"
            value={input}
            onChange={handleInput}
            placeholder="Type a word above…"
            autoComplete="off"
            autoCorrect="off"
          />
        )}
      </div>
    </>
  )
}

function SC({label,value,color}){return<div className="ta-chip" style={{'--cc':color}}><span className="ta-chip-label">{label}</span><span className="ta-chip-val">{value}</span></div>}

const TA_STYLES=`
  @keyframes ta-orb{0%,100%{transform:translate(0,0)}40%{transform:translate(20px,-15px)}70%{transform:translate(-12px,8px)}}
  @keyframes ta-hit{0%,100%{transform:scale(1);opacity:1}40%{transform:scale(1.5);opacity:0.8}100%{opacity:0}}
  @keyframes ta-enemy-glow{0%,100%{box-shadow:0 0 8px rgba(248,113,113,0.5)}50%{box-shadow:0 0 16px rgba(248,113,113,0.8)}}

  .ta-root{position:relative;display:flex;flex-direction:column;align-items:center;gap:12px;padding:24px 16px 32px;overflow:hidden;}
  .ta-orb{position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none;z-index:0;animation:ta-orb 9s ease-in-out infinite;}
  .ta-orb-1{width:240px;height:240px;background:rgba(248,113,113,0.1);top:-50px;left:-40px;}
  .ta-orb-2{width:200px;height:200px;background:rgba(139,92,246,0.1);bottom:-40px;right:-40px;animation-delay:-4s;}

  .ta-stats{position:relative;z-index:1;display:flex;align-items:center;gap:10px;}
  .ta-chip{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 14px;border-radius:14px;background:rgba(15,23,42,0.65);border:1px solid rgba(139,92,246,0.22);backdrop-filter:blur(10px);}
  .ta-chip-label{font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;}
  .ta-chip-val{font-size:18px;font-weight:800;color:var(--cc);}
  .ta-lives{display:flex;gap:4px;}
  .ta-heart{font-size:18px;transition:all 0.3s ease;}
  .ta-heart--empty{filter:grayscale(1);opacity:0.3;}

  .ta-arena{position:relative;z-index:1;width:100%;max-width:480px;height:280px;border-radius:18px;background:rgba(5,10,20,0.9);border:1.5px solid rgba(139,92,246,0.25);overflow:hidden;backdrop-filter:blur(10px);box-shadow:0 12px 40px rgba(0,0,0,0.5);}

  .ta-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;}
  .ta-overlay-icon{font-size:48px;}
  .ta-overlay-msg{font-size:13px;color:#64748b;text-align:center;max-width:280px;}
  .ta-overlay-score{font-size:20px;color:#f1f5f9;font-weight:600;}

  .ta-enemy{position:absolute;cursor:default;animation:ta-enemy-glow 2s ease-in-out infinite;}
  .ta-enemy--hit{animation:ta-hit 0.4s ease forwards;}
  .ta-e-word{background:rgba(248,113,113,0.18);border:1.5px solid rgba(248,113,113,0.4);border-radius:8px;padding:4px 8px;font-size:13px;font-weight:700;color:#f87171;white-space:nowrap;font-family:monospace;backdrop-filter:blur(4px);}
  .ta-e-typed{color:#4ade80;}

  .ta-input{position:relative;z-index:1;width:100%;max-width:480px;padding:14px 18px;border-radius:16px;background:rgba(15,23,42,0.75);border:2px solid rgba(139,92,246,0.4);color:#f1f5f9;font-size:17px;font-family:monospace;font-weight:700;outline:none;transition:border-color 0.2s;letter-spacing:0.05em;}
  .ta-input:focus{border-color:#8b5cf6;}

  .ta-btn{padding:12px 28px;border-radius:14px;background:linear-gradient(135deg,#8b5cf6,#06b6d4);border:none;color:#fff;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 6px 18px rgba(139,92,246,0.4);transition:all 0.25s ease;}
  .ta-btn:hover{transform:translateY(-3px);box-shadow:0 10px 26px rgba(139,92,246,0.55);}
`
