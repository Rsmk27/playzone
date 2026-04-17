import { useState } from 'react'

function NumberGuessing() {
  const [secret, setSecret] = useState(Math.floor(Math.random() * 100) + 1)
  const [guess, setGuess] = useState('')
  const [message, setMessage] = useState('Guess a number between 1 and 100.')
  const [tries, setTries] = useState(0)

  const handleGuess = () => {
    const n = parseInt(guess)
    if (isNaN(n)) return

    const newTries = tries + 1
    setTries(newTries)

    if (n === secret) {
      setMessage(`Correct! It was ${secret}. Resetting…`)
      setTimeout(() => {
        setSecret(Math.floor(Math.random() * 100) + 1)
        setTries(0)
        setMessage('New number. Guess again!')
        setGuess('')
      }, 1500)
    } else if (n < secret) {
      setMessage('Too low!')
    } else {
      setMessage('Too high!')
    }
  }

  return (
    <div>
      <div className="tally">
        <span>Tries: {tries}</span>
      </div>
      
      <div className="info">{message}</div>

      <div className="controls" style={{ flexDirection: 'column', gap: '16px' }}>
        <input 
          type="number" 
          className="search" 
          value={guess} 
          onChange={(e) => setGuess(e.target.value)}
          placeholder="1-100"
          onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
        />
        <button className="btn" onClick={handleGuess}>Guess</button>
      </div>
    </div>
  )
}

export default NumberGuessing
