import { useState, useEffect, useRef } from 'react'

function MathQuiz() {
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [time, setTime] = useState(0)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [currentAnswer, setCurrentAnswer] = useState(0)
  const [feedback, setFeedback] = useState({ text: '', type: '' })
  const inputRef = useRef(null)

  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

  const newQuestion = () => {
    const ops = ['+', '-', '×', '÷']
    const op = ops[randomInt(0, ops.length - 1)]
    let a, b, ans
    
    switch(op) {
      case '+':
        a = randomInt(1, 50)
        b = randomInt(1, 50)
        ans = a + b
        break
      case '-':
        a = randomInt(10, 50)
        b = randomInt(1, a)
        ans = a - b
        break
      case '×':
        a = randomInt(1, 12)
        b = randomInt(1, 12)
        ans = a * b
        break
      case '÷':
        b = randomInt(1, 12)
        ans = randomInt(1, 12)
        a = b * ans
        break
      default:
        a = 1; b = 1; ans = 2;
    }
    
    setQuestion(`${a} ${op} ${b} = ?`)
    setCurrentAnswer(ans)
    setAnswer('')
    setFeedback({ text: '', type: '' })
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus()
    }, 10)
  }

  const checkAnswer = () => {
    if (feedback.text) return // Prevent multiple submissions during feedback

    const userAnswer = parseInt(answer)
    if (isNaN(userAnswer)) return

    if (userAnswer === currentAnswer) {
      setScore(s => s + 1)
      setStreak(s => s + 1)
      setFeedback({ text: '✓ Correct!', type: 'correct' })
    } else {
      setStreak(0)
      setFeedback({ text: `✗ Wrong! Answer: ${currentAnswer}`, type: 'incorrect' })
    }
    
    setTimeout(newQuestion, 1500)
  }

  useEffect(() => {
    newQuestion()
    const timer = setInterval(() => setTime(t => t + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="game-container">
      <div className="score" style={{ 
        width: '100%', 
        maxWidth: '500px', 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr', 
        gap: '10px',
        margin: '10px 0'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Score</div>
          <div style={{ fontSize: '24px' }}>{score}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Streak</div>
          <div style={{ fontSize: '24px' }}>{streak}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Time</div>
          <div style={{ fontSize: '24px' }}>{time}s</div>
        </div>
      </div>

      <div className="info" style={{ 
        fontSize: '48px', 
        margin: '30px 0', 
        fontWeight: '800', 
        background: 'var(--accent-gradient)', 
        WebkitBackgroundClip: 'text', 
        WebkitTextFillColor: 'transparent',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        backgroundSize: '100%'
      }}>
        {question}
      </div>

      <input 
        ref={inputRef}
        type="number" 
        className="search" 
        style={{ 
          width: '150px', 
          textAlign: 'center', 
          fontSize: '32px', 
          height: '80px', 
          marginBottom: '20px',
          background: 'rgba(30, 27, 75, 0.4)'
        }}
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        onKeyPress={e => e.key === 'Enter' && checkAnswer()}
        placeholder="?"
      />

      <div className="info" style={{ 
        minHeight: '60px', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: feedback.type === 'correct' ? 'var(--success)' : (feedback.type === 'incorrect' ? 'var(--danger)' : 'inherit')
      }}>
        {feedback.text}
      </div>

      <div className="controls">
        <button className="btn" onClick={checkAnswer}>Submit</button>
        <button className="btn" onClick={newQuestion}>Skip</button>
      </div>
    </div>
  )
}

export default MathQuiz
