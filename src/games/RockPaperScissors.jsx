import { useState, useEffect } from 'react'

const OPTIONS = ['Rock', 'Paper', 'Scissors']

function RockPaperScissors() {
  const [score, setScore] = useState({ player: 0, cpu: 0, rounds: 0 })
  const [message, setMessage] = useState('Pick Rock, Paper, or Scissors.')
  const [lastResult, setLastResult] = useState(null)

  const pickCPU = () => OPTIONS[Math.floor(Math.random() * 3)]

  const getWinner = (p, c) => {
    if (p === c) return 'Draw'
    if (
      (p === 'Rock' && c === 'Scissors') ||
      (p === 'Paper' && c === 'Rock') ||
      (p === 'Scissors' && c === 'Paper')
    ) {
      return 'Player'
    }
    return 'CPU'
  }

  const play = (playerChoice) => {
    const cpuChoice = pickCPU()
    const winner = getWinner(playerChoice, cpuChoice)
    
    setScore(prev => ({
      player: prev.player + (winner === 'Player' ? 1 : 0),
      cpu: prev.cpu + (winner === 'CPU' ? 1 : 0),
      rounds: prev.rounds + 1
    }))

    setMessage(`You chose ${playerChoice}. CPU chose ${cpuChoice}. ${winner === 'Draw' ? "It's a Draw!" : winner + ' wins!'}`)
    setLastResult({ player: playerChoice, cpu: cpuChoice, winner })
  }

  return (
    <div>
      <div className="tally">
        <span>Score: You {score.player} - {score.cpu} CPU</span>
        <span>Rounds: {score.rounds}</span>
      </div>
      
      <div className="info">{message}</div>

      <div className="controls">
        {OPTIONS.map(opt => (
          <button 
            key={opt} 
            className="btn" 
            onClick={() => play(opt)}
            style={{ margin: '0 8px' }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

export default RockPaperScissors
