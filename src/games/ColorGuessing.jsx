import { useState, useEffect } from 'react'

function ColorGuessing() {
  const [score, setScore] = useState(0)
  const [currentColor, setCurrentColor] = useState(null)
  const [options, setOptions] = useState([])
  const [answered, setAnswered] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const [feedback, setFeedback] = useState({ text: '', type: '' })

  const randomColor = () => {
    const r = Math.floor(Math.random() * 256)
    const g = Math.floor(Math.random() * 256)
    const b = Math.floor(Math.random() * 256)
    return { r, g, b, rgb: `rgb(${r}, ${g}, ${b})`, hex: `RGB(${r}, ${g}, ${b})` }
  }

  const generateOptions = (correct) => {
    const opts = [correct.hex]
    while (opts.length < 6) {
      const color = randomColor()
      if (!opts.includes(color.hex)) {
        opts.push(color.hex)
      }
    }
    return opts.sort(() => Math.random() - 0.5)
  }

  const initGame = () => {
    const color = randomColor()
    setCurrentColor(color)
    setOptions(generateOptions(color))
    setAnswered(false)
    setSelectedOption(null)
    setFeedback({ text: '', type: '' })
  }

  useEffect(() => {
    initGame()
  }, [])

  const handleSelect = (selected) => {
    if (answered) return
    setAnswered(true)
    setSelectedOption(selected)

    if (selected === currentColor.hex) {
      setScore(s => s + 1)
      setFeedback({ text: '✓ Correct!', type: 'correct' })
    } else {
      setFeedback({ text: `✗ Wrong!`, type: 'incorrect' })
    }
  }

  return (
    <div className="game-container">
      <div className="score">Score: {score}</div>
      
      {currentColor && (
        <div 
          style={{ 
            width: '100%', 
            height: '200px', 
            backgroundColor: currentColor.rgb,
            borderRadius: '20px',
            marginBottom: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            border: '4px solid var(--card-border)'
          }}
        />
      )}

      <div className="info" style={{ 
        minHeight: '60px', 
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: feedback.type === 'correct' ? 'var(--success)' : (feedback.type === 'incorrect' ? 'var(--danger)' : 'inherit')
      }}>
        {feedback.text || 'Guess the RGB color code!'}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
        gap: '12px', 
        width: '100%',
        marginBottom: '20px'
      }}>
        {options.map((opt, i) => {
          let btnStyle = {
            background: 'rgba(30, 27, 75, 0.6)',
            borderColor: 'var(--card-border)',
            color: 'var(--text)',
            fontSize: '13px',
            fontFamily: 'monospace',
            padding: '15px 10px'
          }

          if (answered) {
            if (opt === currentColor.hex) {
              btnStyle.background = 'var(--success)'
              btnStyle.borderColor = 'var(--success)'
            } else if (opt === selectedOption && feedback.type === 'incorrect') {
              btnStyle.background = 'var(--danger)'
              btnStyle.borderColor = 'var(--danger)'
            }
          }

          return (
            <button
              key={i}
              className="btn"
              style={btnStyle}
              onClick={() => handleSelect(opt)}
              disabled={answered}
            >
              {opt}
            </button>
          )
        })}
      </div>

      <div className="controls">
        <button className="btn" onClick={initGame}>New Color</button>
      </div>
    </div>
  )
}

export default ColorGuessing
