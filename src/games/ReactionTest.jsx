import { useState, useRef, useEffect } from 'react'

function ReactionTest() {
  const [state, setState] = useState('waiting') // 'waiting', 'ready', 'go'
  const [message, setMessage] = useState('Click to Start')
  const [last, setLast] = useState('-')
  const [best, setBest] = useState('-')
  const [avg, setAvg] = useState('-')
  const times = useRef([])
  const startTime = useRef(0)
  const timerId = useRef(null)

  const handleClick = () => {
    if (state === 'waiting') {
      setState('ready')
      setMessage('Wait for GREEN...')
      
      const delay = 2000 + Math.random() * 3000
      timerId.current = setTimeout(() => {
        setState('go')
        setMessage('CLICK NOW!')
        startTime.current = Date.now()
      }, delay)

    } else if (state === 'ready') {
      clearTimeout(timerId.current)
      setState('waiting')
      setMessage('Too early! Click to try again')

    } else if (state === 'go') {
      const reactionTime = Date.now() - startTime.current
      times.current.push(reactionTime)
      
      setLast(reactionTime)
      setBest(Math.min(...times.current))
      const average = Math.round(times.current.reduce((a, b) => a + b, 0) / times.current.length)
      setAvg(average)
      
      setState('waiting')
      setMessage(`${reactionTime}ms - Click to try again`)
    }
  }

  const reset = () => {
    times.current = []
    setLast('-')
    setBest('-')
    setAvg('-')
    setState('waiting')
    setMessage('Click to Start')
    if (timerId.current) clearTimeout(timerId.current)
  }

  useEffect(() => {
    return () => {
      if (timerId.current) clearTimeout(timerId.current)
    }
  }, [])

  const getBgColor = () => {
    switch (state) {
      case 'ready': return 'var(--warning)'
      case 'go': return 'var(--success)'
      default: return 'var(--accent-gradient)'
    }
  }

  return (
    <div className="game-container">
      <div 
        className="thumb"
        style={{ 
          width: '100%', 
          height: '300px', 
          background: getBgColor(),
          color: 'white',
          fontSize: '32px',
          cursor: 'pointer',
          userSelect: 'none',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '20px'
        }}
        onClick={handleClick}
      >
        {message}
      </div>

      <div className="score" style={{ 
        width: '100%', 
        maxWidth: '500px', 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr', 
        gap: '10px',
        margin: '20px 0'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Last</div>
          <div style={{ fontSize: '24px' }}>{last}{last !== '-' ? 'ms' : ''}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Best</div>
          <div style={{ fontSize: '24px', color: 'var(--success)' }}>{best}{best !== '-' ? 'ms' : ''}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Average</div>
          <div style={{ fontSize: '24px' }}>{avg}{avg !== '-' ? 'ms' : ''}</div>
        </div>
      </div>

      <div className="controls">
        <button className="btn" onClick={reset}>Reset Stats</button>
      </div>
    </div>
  )
}

export default ReactionTest
