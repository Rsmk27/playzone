import { useState, useEffect, useCallback } from 'react'

function Sudoku() {
  const [solution, setSolution] = useState([])
  const [puzzle, setPuzzle] = useState([])
  const [userInput, setUserInput] = useState([])
  const [message, setMessage] = useState('Fill in the numbers 1-9')

  const isValid = (grid, row, col, num) => {
    for (let x = 0; x < 9; x++) {
      if (grid[row][x] === num || grid[x][col] === num) return false
    }
    const startRow = row - row % 3, startCol = col - col % 3
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[i + startRow][j + startCol] === num) return false
      }
    }
    return true
  }

  const fillRemaining = (grid, i, j) => {
    if (j >= 9 && i < 8) {
      i++
      j = 0
    }
    if (i >= 9 && j >= 9) return true
    if (i < 3) {
      if (j < 3) j = 3
    } else if (i < 6) {
      if (j === Math.floor(i / 3) * 3) j += 3
    } else {
      if (j === 6) {
        i++
        j = 0
        if (i >= 9) return true
      }
    }

    for (let num = 1; num <= 9; num++) {
      if (isValid(grid, i, j, num)) {
        grid[i][j] = num
        if (fillRemaining(grid, i, j + 1)) return true
        grid[i][j] = 0
      }
    }
    return false
  }

  const generateSudoku = useCallback(() => {
    const sol = Array(9).fill().map(() => Array(9).fill(0))
    
    // Fill diagonal 3x3 boxes
    for (let i = 0; i < 9; i += 3) {
      let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5)
      let idx = 0
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          sol[i + r][i + c] = nums[idx++]
        }
      }
    }
    
    fillRemaining(sol, 0, 3)
    setSolution(sol.map(row => [...row]))

    const puz = sol.map(row => [...row])
    let count = 40 // Remove 40 numbers
    while (count > 0) {
      const r = Math.floor(Math.random() * 9)
      const c = Math.floor(Math.random() * 9)
      if (puz[r][c] !== 0) {
        puz[r][c] = 0
        count--
      }
    }
    setPuzzle(puz)
    setUserInput(puz.map(row => row.map(cell => cell === 0 ? '' : cell)))
    setMessage('Fill in the numbers 1-9')
  }, [])

  useEffect(() => {
    generateSudoku()
  }, [generateSudoku])

  const handleInputChange = (r, c, val) => {
    if (puzzle[r][c] !== 0) return
    if (val !== '' && !/[1-9]/.test(val)) return
    
    const newInput = userInput.map((row, ri) => 
      row.map((cell, ci) => (ri === r && ci === c) ? val : cell)
    )
    setUserInput(newInput)
  }

  const checkSolution = () => {
    const isCorrect = userInput.every((row, r) => 
      row.every((cell, c) => parseInt(cell) === solution[r][c])
    )
    if (isCorrect) {
      setMessage('Correct! Well done! 🎉')
    } else {
      setMessage('Not quite right. Keep trying! ❌')
    }
  }

  return (
    <div className="game-container">
      <div className="info">{message}</div>

      <div className="board" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(9, minmax(30px, 45px))',
        background: 'rgba(30, 27, 75, 0.8)',
        padding: '10px',
        borderRadius: '12px',
        border: '3px solid var(--card-border)',
        margin: '20px auto',
        gap: '0'
      }}>
        {userInput.map((row, r) => (
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              style={{
                width: '100%',
                aspectRatio: '1/1',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRight: (c + 1) % 3 === 0 && c < 8 ? '2px solid var(--accent)' : '',
                borderBottom: (r + 1) % 3 === 0 && r < 8 ? '2px solid var(--accent)' : '',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: puzzle[r][c] !== 0 ? 'rgba(255,255,255,0.05)' : 'transparent'
              }}
            >
              {puzzle[r][c] !== 0 ? (
                <span style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--text)' }}>
                  {cell}
                </span>
              ) : (
                <input
                  type="text"
                  maxLength="1"
                  value={cell}
                  onChange={(e) => handleInputChange(r, c, e.target.value)}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'center',
                    fontSize: '18px',
                    color: 'var(--accent-2)',
                    fontWeight: 'bold',
                    outline: 'none'
                  }}
                />
              )}
            </div>
          ))
        ))}
      </div>

      <div className="game-controls">
        <button className="game-btn" onClick={checkSolution}>Check Solution</button>
        <button className="game-btn" onClick={generateSudoku} style={{ background: 'var(--card-border)' }}>New Game</button>
      </div>
    </div>
  )
}

export default Sudoku
