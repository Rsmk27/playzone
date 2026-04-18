import { useState, useEffect } from 'react'

const QUESTIONS = [
  {
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correct: 2
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correct: 1
  },
  {
    question: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
    correct: 2
  },
  {
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
    correct: 3
  },
  {
    question: "In which year did World War II end?",
    options: ["1943", "1944", "1945", "1946"],
    correct: 2
  },
  {
    question: "What is the smallest country in the world?",
    options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
    correct: 1
  },
  {
    question: "How many continents are there?",
    options: ["5", "6", "7", "8"],
    correct: 2
  },
  {
    question: "What is the chemical symbol for gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correct: 2
  },
  {
    question: "Who wrote 'Romeo and Juliet'?",
    options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
    correct: 1
  },
  {
    question: "What is the fastest land animal?",
    options: ["Lion", "Cheetah", "Leopard", "Tiger"],
    correct: 1
  },
  {
    question: "What is the tallest mountain in the world?",
    options: ["K2", "Kangchenjunga", "Mount Everest", "Lhotse"],
    correct: 2
  },
  {
    question: "Which element has the atomic number 1?",
    options: ["Helium", "Hydrogen", "Oxygen", "Carbon"],
    correct: 1
  },
  {
    question: "How many sides does a hexagon have?",
    options: ["5", "6", "7", "8"],
    correct: 1
  },
  {
    question: "What is the largest mammal in the world?",
    options: ["African Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
    correct: 1
  },
  {
    question: "In which country would you find the Great Pyramid of Giza?",
    options: ["Mexico", "Greece", "Egypt", "Iraq"],
    correct: 2
  }
]

function Quiz() {
  const [gameState, setGameState] = useState('start') // start, playing, result
  const [quizQuestions, setQuizQuestions] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedIdx, setSelectedIdx] = useState(null)
  const [showNext, setShowNext] = useState(false)

  const startQuiz = () => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10)
    setQuizQuestions(shuffled)
    setCurrentIdx(0)
    setScore(0)
    setSelectedIdx(null)
    setShowNext(false)
    setGameState('playing')
  }

  const handleSelect = (idx) => {
    if (selectedIdx !== null) return
    setSelectedIdx(idx)
    if (idx === quizQuestions[currentIdx].correct) {
      setScore(s => s + 1)
    }
    setShowNext(true)
  }

  const nextQuestion = () => {
    if (currentIdx + 1 < quizQuestions.length) {
      setCurrentIdx(currentIdx + 1)
      setSelectedIdx(null)
      setShowNext(false)
    } else {
      setGameState('result')
    }
  }

  const getResultMessage = () => {
    const percentage = (score / quizQuestions.length) * 100
    if (percentage === 100) return '🎉 Perfect! You\'re a genius!'
    if (percentage >= 80) return '🌟 Excellent work!'
    if (percentage >= 60) return '👍 Good job!'
    if (percentage >= 40) return '📚 Not bad, keep learning!'
    return '💪 Keep trying, you\'ll improve!'
  }

  if (gameState === 'start') {
    return (
      <div className="game-container" style={{ textAlign: 'center' }}>
        <div className="info">
          <p>Answer 10 questions and test your general knowledge!</p>
        </div>
        <button className="btn" onClick={startQuiz}>Start Quiz</button>
      </div>
    )
  }

  if (gameState === 'result') {
    return (
      <div className="game-container" style={{ textAlign: 'center' }}>
        <h2>Quiz Complete!</h2>
        <div className="score" style={{ fontSize: '3em', margin: '20px 0' }}>{score}/{quizQuestions.length}</div>
        <div className="info" style={{ marginBottom: '30px' }}>{getResultMessage()}</div>
        <button className="btn" onClick={startQuiz}>Play Again</button>
      </div>
    )
  }

  const q = quizQuestions[currentIdx]

  return (
    <div className="game-container">
      <div className="score-board" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <span>Question {currentIdx + 1}/{quizQuestions.length}</span>
        <span className="score">Score: {score}</span>
      </div>

      <div id="question" style={{ fontSize: '1.4em', marginBottom: '30px', color: 'var(--text)', lineHeight: '1.6' }}>
        {q.question}
      </div>

      <div className="options" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {q.options.map((opt, i) => {
          let className = 'option'
          const isSelected = selectedIdx === i
          const isCorrect = i === q.correct
          
          let style = {
            padding: '20px',
            background: 'var(--card-bg, #f7f7f7)',
            border: '2px solid var(--card-border, #ddd)',
            borderRadius: '10px',
            cursor: selectedIdx === null ? 'pointer' : 'default',
            fontSize: '1.1em',
            transition: 'all 0.3s'
          }

          if (selectedIdx !== null) {
            if (isCorrect) {
              style.background = '#d1fae5'
              style.borderColor = '#10b981'
            } else if (isSelected) {
              style.background = '#fee2e2'
              style.borderColor = '#ef4444'
            } else {
              style.opacity = 0.7
            }
          }

          return (
            <div 
              key={i} 
              style={style}
              onClick={() => handleSelect(i)}
            >
              {opt}
            </div>
          )
        })}
      </div>

      {showNext && (
        <button className="btn" style={{ marginTop: '20px', display: 'block', margin: '20px auto 0' }} onClick={nextQuestion}>
          {currentIdx + 1 < quizQuestions.length ? 'Next Question' : 'Show Results'}
        </button>
      )}
    </div>
  )
}

export default Quiz
