import { useState, useEffect, useRef } from 'react'

const WORDS = [
  'JAVASCRIPT', 'PYTHON', 'PROGRAMMING', 'COMPUTER', 'KEYBOARD',
  'INTERNET', 'DATABASE', 'ALGORITHM', 'DEVELOPER', 'SOFTWARE',
  'HARDWARE', 'NETWORK', 'SECURITY', 'FUNCTION', 'VARIABLE',
  'DOCUMENT', 'BROWSER', 'APPLICATION', 'TECHNOLOGY', 'DIGITAL'
]

const MAX_WRONG = 6

function Hangman() {
  const [currentWord, setCurrentWord] = useState('')
  const [guessedLetters, setGuessedLetters] = useState([])
  const [wrongGuesses, setWrongGuesses] = useState(0)
  const [score, setScore] = useState(0)
  const [gameStatus, setGameStatus] = useState('playing') // playing, won, lost
  const canvasRef = useRef(null)

  useEffect(() => {
    newGame()
  }, [])

  useEffect(() => {
    drawHangman()
  }, [wrongGuesses])

  const newGame = () => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)]
    setCurrentWord(word)
    setGuessedLetters([])
    setWrongGuesses(0)
    setGameStatus('playing')
  }

  const drawHangman = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 3

    // Base
    if (wrongGuesses >= 0) {
      ctx.beginPath(); ctx.moveTo(20, 280); ctx.lineTo(180, 280); ctx.stroke()
    }
    // Pole
    if (wrongGuesses >= 1) {
      ctx.beginPath(); ctx.moveTo(60, 280); ctx.lineTo(60, 20); ctx.stroke()
    }
    // Top
    if (wrongGuesses >= 2) {
      ctx.beginPath(); ctx.moveTo(60, 20); ctx.lineTo(160, 20); ctx.stroke()
    }
    // Rope
    if (wrongGuesses >= 3) {
      ctx.beginPath(); ctx.moveTo(160, 20); ctx.lineTo(160, 60); ctx.stroke()
    }
    // Head
    if (wrongGuesses >= 4) {
      ctx.beginPath(); ctx.arc(160, 80, 20, 0, Math.PI * 2); ctx.stroke()
    }
    // Body
    if (wrongGuesses >= 5) {
      ctx.beginPath(); ctx.moveTo(160, 100); ctx.lineTo(160, 180); ctx.stroke()
    }
    // Arms & Legs
    if (wrongGuesses >= 6) {
      // Arms
      ctx.beginPath(); ctx.moveTo(160, 120); ctx.lineTo(130, 150)
      ctx.moveTo(160, 120); ctx.lineTo(190, 150)
      // Legs
      ctx.moveTo(160, 180); ctx.lineTo(130, 230)
      ctx.moveTo(160, 180); ctx.lineTo(190, 230)
      ctx.stroke()
    }
  }

  const handleGuess = (letter) => {
    if (gameStatus !== 'playing' || guessedLetters.includes(letter)) return

    const newGuessed = [...guessedLetters, letter]
    setGuessedLetters(newGuessed)

    if (!currentWord.includes(letter)) {
      const nextWrong = wrongGuesses + 1
      setWrongGuesses(nextWrong)
      if (nextWrong >= MAX_WRONG) {
        setGameStatus('lost')
      }
    } else {
      const isWon = currentWord.split('').every(l => newGuessed.includes(l))
      if (isWon) {
        setGameStatus('won')
        setScore(s => s + 1)
      }
    }
  }

  const renderWord = () => {
    return currentWord.split('').map(letter => 
      guessedLetters.includes(letter) ? letter : '_'
    ).join(' ')
  }

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  return (
    <div className="game-container" style={{ textAlign: 'center' }}>
      <canvas 
        ref={canvasRef} 
        width="300" 
        height="300" 
        style={{ 
          display: 'block', 
          margin: '0 auto 30px', 
          border: '3px solid #eee', 
          borderRadius: '10px',
          background: 'white'
        }}
      />
      
      <div style={{ 
        textAlign: 'center', 
        fontSize: '3em', 
        letterSpacing: '10px', 
        margin: '0 auto 30px', 
        fontFamily: 'monospace', 
        color: '#333', 
        minHeight: '80px',
        maxWidth: '100%',
        overflowX: 'auto'
      }}>
        {renderWord()}
      </div>

      <div className="info" style={{ marginBottom: '20px' }}>
        <span>{wrongGuesses}</span> / {MAX_WRONG} wrong guesses
        <br />
        Score: <span>{score}</span>
      </div>

      {gameStatus === 'won' && <div className="message win" style={{ color: '#10b981', fontSize: '1.5em', fontWeight: 'bold', margin: '20px 0' }}>🎉 You won!</div>}
      {gameStatus === 'lost' && <div className="message lose" style={{ color: '#ef4444', fontSize: '1.5em', fontWeight: 'bold', margin: '20px 0' }}>😞 Game Over! Word was: {currentWord}</div>}

      <div className="keyboard" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(40px, 1fr))', 
        gap: '8px', 
        marginBottom: '20px',
        maxWidth: '600px',
        margin: '0 auto 20px'
      }}>
        {letters.map(l => (
          <button
            key={l}
            className={`key ${guessedLetters.includes(l) ? (currentWord.includes(l) ? 'correct' : 'wrong') : ''}`}
            style={{
              padding: '10px',
              background: guessedLetters.includes(l) ? (currentWord.includes(l) ? '#10b981' : '#ef4444') : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: (gameStatus !== 'playing' || guessedLetters.includes(l)) ? 'not-allowed' : 'pointer',
              fontSize: '1.1em',
              fontWeight: 'bold',
              opacity: guessedLetters.includes(l) ? 0.5 : 1
            }}
            onClick={() => handleGuess(l)}
            disabled={gameStatus !== 'playing' || guessedLetters.includes(l)}
          >
            {l}
          </button>
        ))}
      </div>

      <button className="btn" onClick={newGame}>New Game</button>
    </div>
  )
}

export default Hangman
