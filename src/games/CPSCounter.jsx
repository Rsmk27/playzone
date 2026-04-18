import { useState, useEffect, useRef } from 'react'

function CPSCounter() {
  const [clicks, setClicks] = useState(0)
  const [timeLeft, setTimeLeft] = useState(10)
  const [cps, setCps] = useState('0.00')
  const [testing, setTesting] = useState(false)
  const startTime = useRef(null)
  const timerInterval = useRef(null)

  const startTest = () => {
    reset()
    setTesting(true)
    startTime.current = Date.now()
    setTimeLeft(10)
    
    timerInterval.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval.current)
          setTesting(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const reset = () => {
    setTesting(false)
    setClicks(0)
    setTimeLeft(10)
    setCps('0.00')
    if (timerInterval.current) clearInterval(timerInterval.current)
  }

  const handleClick = () => {
    if (testing) {
      setClicks(prev => {
        const newClicks = prev + 1
        const elapsed = (Date.now() - startTime.current) / 1000
        setCps((newClicks / elapsed).toFixed(2))
        return newClicks
      })
    }
  }

  useEffect(() => {
    return () => clearInterval(timerInterval.current)
  }, [])

  return (
    <div className="game-container">
      <div 
        className="thumb"
        style={{ 
          width: '250px', 
          height: '250px', 
          borderRadius: '50%', 
          cursor: 'pointer',
          userSelect: 'none',
          fontSize: '24px',
          margin: '20px auto',
          background: testing ? 'var(--accent-gradient)' : 'rgba(139, 92, 246, 0.1)',
          transition: 'all 0.1s'
        }}
        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        onClick={handleClick}
      >
        {testing ? 'CLICK!' : 'Click Start'}
      </div>

      <div className="score" style={{ 
        width: '100%', 
        maxWidth: '400px', 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr', 
        gap: '10px',
        margin: '20px 0'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Clicks</div>
          <div style={{ fontSize: '24px' }}>{clicks}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>CPS</div>
          <div style={{ fontSize: '24px' }}>{cps}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Time</div>
          <div style={{ fontSize: '24px' }}>{timeLeft}s</div>
        </div>
      </div>

      <div className="controls">
        <button className="btn" onClick={startTest} disabled={testing}>Start Test</button>
        <button className="btn" onClick={reset}>Reset</button>
      </div>
    </div>
  )
}

export default CPSCounter
