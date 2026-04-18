import { useState, useEffect } from 'react'

const ICONS = ['🚗','🚒','🏎️','🚑','✈️','🛥️','🚁','🏍️']

function MemoryCards() {
  const [cards, setCards] = useState([])
  const [openSel, setOpenSel] = useState([])
  const [moves, setMoves] = useState(0)
  const [matched, setMatched] = useState(0)
  const [message, setMessage] = useState('Flip two matching cards.')

  useEffect(() => {
    resetGame()
  }, [])

  const resetGame = () => {
    const doubled = [...ICONS, ...ICONS]
    const shuffled = doubled
      .sort(() => Math.random() - 0.5)
      .map((v, i) => ({ id: i, val: v, open: false, done: false }))
    setCards(shuffled)
    setOpenSel([])
    setMoves(0)
    setMatched(0)
    setMessage('Flip two matching cards.')
  }

  const handleFlip = (card) => {
    if (card.done || card.open || openSel.length === 2) return

    const newCards = cards.map(c => 
      c.id === card.id ? { ...c, open: true } : c
    )
    setCards(newCards)
    
    const newOpenSel = [...openSel, card]
    setOpenSel(newOpenSel)

    if (newOpenSel.length === 2) {
      setMoves(m => m + 1)
      
      setTimeout(() => {
        const [a, b] = newOpenSel
        if (a.val === b.val) {
          setCards(prev => prev.map(c => 
            (c.id === a.id || c.id === b.id) ? { ...c, done: true, open: false } : c
          ))
          setMatched(prev => {
            const next = prev + 1
            if (next === ICONS.length) {
              setMessage('Great memory! All matched!')
            }
            return next
          })
        } else {
          setCards(prev => prev.map(c => 
            (c.id === a.id || c.id === b.id) ? { ...c, open: false } : c
          ))
        }
        setOpenSel([])
      }, 600)
    }
  }

  return (
    <div className="game-container">
      <div className="tally" style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px', fontSize: '1.2em' }}>
        <span>Moves: {moves}</span>
        <span>Matched: {matched}/{ICONS.length}</span>
      </div>

      <div className="info" style={{ textAlign: 'center', marginBottom: '20px' }}>{message}</div>

      <div className="board grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, minmax(60px, 1fr))', 
        gap: '12px',
        maxWidth: '400px',
        margin: '0 auto'
      }}>
        {cards.map(card => (
          <div
            key={card.id}
            className="card-min"
            style={{
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: (card.done || card.open) ? 'default' : 'pointer',
              fontSize: '2em',
              background: (card.open || card.done) ? 'white' : 'var(--primary)',
              color: (card.open || card.done) ? 'inherit' : 'transparent',
              border: '2px solid var(--card-border, #ddd)',
              borderRadius: '10px',
              opacity: card.done ? 0.6 : 1,
              filter: card.done ? 'grayscale(1)' : 'none',
              transition: 'all 0.3s'
            }}
            onClick={() => handleFlip(card)}
          >
            {(card.open || card.done) ? card.val : '❓'}
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button className="btn" onClick={resetGame}>Reset Game</button>
      </div>
    </div>
  )
}

export default MemoryCards
