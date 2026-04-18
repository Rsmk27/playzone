import { useState } from 'react'

function DiceRoller() {
  const [history, setHistory] = useState([])
  const [message, setMessage] = useState('Click to roll a six-sided die.')

  const rollDice = () => {
    const n = Math.floor(Math.random() * 6) + 1
    setMessage(`You rolled: ${n}`)
    setHistory(prev => [...prev, n])
  }

  const reset = () => {
    setHistory([])
    setMessage('Click to roll a six-sided die.')
  }

  return (
    <div className="game-container">
      <div className="info">{message}</div>
      
      <div className="score">
        History: {history.join(' ')}
      </div>

      <div className="controls">
        <button className="btn" onClick={rollDice}>Roll d6</button>
        <button className="btn" onClick={reset}>Reset</button>
      </div>
    </div>
  )
}

export default DiceRoller
