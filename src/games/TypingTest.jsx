import { useState, useEffect, useRef } from 'react'

const TEXTS = [
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump.",
  "A journey of a thousand miles begins with a single step. Success is not final, failure is not fatal. It is the courage to continue that counts.",
  "The only way to do great work is to love what you do. Innovation distinguishes between a leader and a follower. Stay hungry, stay foolish.",
  "Life is what happens when you are busy making other plans. The future belongs to those who believe in the beauty of their dreams.",
  "Code is like humor. When you have to explain it, it is bad. First solve the problem then write the code. Make it work make it right make it fast."
]

function TypingTest() {
  const [currentText, setCurrentText] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [isStarted, setIsStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [showResult, setShowResult] = useState(false)
  const [startTime, setStartTime] = useState(null)
  
  const timerRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    setCurrentText(TEXTS[Math.floor(Math.random() * TEXTS.length)])
  }, [])

  useEffect(() => {
    if (isStarted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      endTest()
    }
    return () => clearInterval(timerRef.current)
  }, [isStarted, timeLeft])

  const startTest = () => {
    const text = TEXTS[Math.floor(Math.random() * TEXTS.length)]
    setCurrentText(text)
    setInputValue('')
    setIsStarted(true)
    setTimeLeft(60)
    setWpm(0)
    setAccuracy(100)
    setShowResult(false)
    setStartTime(Date.now())
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const endTest = () => {
    setIsStarted(false)
    setShowResult(true)
    clearInterval(timerRef.current)
  }

  const handleInputChange = (e) => {
    if (!isStarted) return
    
    const val = e.target.value
    setInputValue(val)

    // Calculate stats
    let correctChars = 0
    for (let i = 0; i < val.length; i++) {
      if (val[i] === currentText[i]) {
        correctChars++
      }
    }

    const elapsedMinutes = (Date.now() - startTime) / 60000
    const wordsTyped = correctChars / 5
    const currentWpm = elapsedMinutes > 0 ? Math.round(wordsTyped / elapsedMinutes) : 0
    const currentAccuracy = val.length > 0 ? Math.round((correctChars / val.length) * 100) : 100

    setWpm(currentWpm)
    setAccuracy(currentAccuracy)

    if (val.length >= currentText.length && correctChars === currentText.length) {
      endTest()
    }
  }

  const resetTest = () => {
    setIsStarted(false)
    setShowResult(false)
    setTimeLeft(60)
    setWpm(0)
    setAccuracy(100)
    setInputValue('')
    setCurrentText(TEXTS[Math.floor(Math.random() * TEXTS.length)])
  }

  const renderText = () => {
    return currentText.split('').map((char, i) => {
      let color = '#666'
      let backgroundColor = 'transparent'
      
      if (i < inputValue.length) {
        if (inputValue[i] === currentText[i]) {
          color = '#10b981'
        } else {
          color = '#ef4444'
          backgroundColor = '#fee'
        }
      } else if (i === inputValue.length && isStarted) {
        backgroundColor = '#667eea'
        color = 'white'
      }

      return (
        <span key={i} style={{ color, backgroundColor }}>
          {char}
        </span>
      )
    })
  }

  return (
    <div className="game-container">
      <div className="stats" style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '30px', gap: '20px' }}>
        <div className="stat" style={{ textAlign: 'center', padding: '20px', background: 'var(--card-bg, #f7f7f7)', borderRadius: '10px', flex: 1 }}>
          <div style={{ color: '#666', fontSize: '0.9em' }}>Time</div>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#667eea' }}>{timeLeft}</div>
        </div>
        <div className="stat" style={{ textAlign: 'center', padding: '20px', background: 'var(--card-bg, #f7f7f7)', borderRadius: '10px', flex: 1 }}>
          <div style={{ color: '#666', fontSize: '0.9em' }}>WPM</div>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#667eea' }}>{wpm}</div>
        </div>
        <div className="stat" style={{ textAlign: 'center', padding: '20px', background: 'var(--card-bg, #f7f7f7)', borderRadius: '10px', flex: 1 }}>
          <div style={{ color: '#666', fontSize: '0.9em' }}>Accuracy</div>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#667eea' }}>{accuracy}%</div>
        </div>
      </div>

      <div style={{ 
        fontSize: '1.5em', 
        lineHeight: '1.8', 
        padding: '30px', 
        background: 'var(--card-bg, #f7f7f7)', 
        borderRadius: '10px', 
        marginBottom: '20px', 
        minHeight: '150px',
        fontFamily: 'monospace'
      }}>
        {renderText()}
      </div>

      <input
        ref={inputRef}
        type="text"
        className="input"
        style={{ 
          width: '100%', 
          padding: '15px', 
          fontSize: '1.2em', 
          border: '2px solid #ddd', 
          borderRadius: '10px', 
          marginBottom: '20px', 
          fontFamily: 'monospace'
        }}
        value={inputValue}
        onChange={handleInputChange}
        disabled={!isStarted}
        placeholder={isStarted ? "Start typing..." : "Click 'Start Test' to begin..."}
        onPaste={e => e.preventDefault()}
      />

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button className="btn" onClick={startTest} disabled={isStarted}>Start Test</button>
        <button className="btn" onClick={resetTest} disabled={!isStarted && !showResult}>Reset</button>
      </div>

      {showResult && (
        <div style={{ textAlign: 'center', padding: '20px', background: '#f0fdf4', borderRadius: '10px', marginTop: '20px' }}>
          <h3 style={{ color: '#10b981', marginBottom: '10px' }}>Test Complete!</h3>
          <p>
            You typed <strong>{wpm} WPM</strong> with <strong>{accuracy}% accuracy</strong>!
          </p>
        </div>
      )}
    </div>
  )
}

export default TypingTest
