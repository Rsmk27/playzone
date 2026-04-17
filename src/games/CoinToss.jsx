import { useState } from 'react'

function CoinToss() {
  const [tally, setTally] = useState({ heads: 0, tails: 0 })
  const [message, setMessage] = useState('Pick Heads or Tails and flip the coin.')
  const [lastResult, setLastResult] = useState(null)

  const flip = (choice) => {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails'
    const newTally = { ...tally }
    if (result === 'Heads') newTally.heads++
    else newTally.tails++
    setTally(newTally)
    setMessage(`It was ${result}. You picked ${choice}. ${result === choice ? 'You won!' : 'You lost!'}`)
    setLastResult(result)
  }

  return (
    <div>
      <div className="tally">
        <span>Heads: {tally.heads}</span>
        <span>Tails: {tally.tails}</span>
      </div>
      
      <div className="info">{message}</div>

      <div className="controls">
        <button className="btn" onClick={() => flip('Heads')} style={{ margin: '0 8px' }}>Heads</button>
        <button className="btn" onClick={() => flip('Tails')} style={{ margin: '0 8px' }}>Tails</button>
      </div>
    </div>
  )
}

export default CoinToss
