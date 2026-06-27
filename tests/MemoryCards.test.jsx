import { render, screen, fireEvent, act, cleanup } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import MemoryCards from '../src/games/MemoryCards'

describe('MemoryCards', () => {
  beforeEach(() => {
    // This makes sorting stable: deck array won't be shuffled
    // [...ICONS, ...ICONS] will be two identical blocks in order
    // ICONS has 8 items. index 0 and index 8 match.
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('renders initial state correctly with 16 cards', () => {
    render(<MemoryCards />)
    const cards = screen.getAllByText('?')
    expect(cards).toHaveLength(16)
    expect(screen.getByText('Moves')).toBeInTheDocument()
    expect(screen.getByText('0/8')).toBeInTheDocument()
  })

  it('flips a card on click', () => {
    const { container } = render(<MemoryCards />)
    const cards = container.querySelectorAll('.mc-card')
    fireEvent.click(cards[0])
    expect(cards[0]).toHaveClass('mc-card--open')
  })

  it('matches two cards correctly', () => {
    const { container } = render(<MemoryCards />)
    const cards = container.querySelectorAll('.mc-card')

    // Cards 0 and 8 should match because we disabled shuffle
    fireEvent.click(cards[0])
    fireEvent.click(cards[8])

    expect(cards[0]).toHaveClass('mc-card--open')
    expect(cards[8]).toHaveClass('mc-card--open')

    act(() => {
      vi.advanceTimersByTime(500)
    })

    // After match, they are marked as done
    expect(cards[0]).toHaveClass('mc-card--done')
    expect(cards[8]).toHaveClass('mc-card--done')
    expect(screen.getAllByText('1/8')[0]).toBeInTheDocument()
  })

  it('mismatches two cards correctly', () => {
    const { container } = render(<MemoryCards />)
    const cards = container.querySelectorAll('.mc-card')

    // Cards 0 and 1 should NOT match
    fireEvent.click(cards[0])
    fireEvent.click(cards[1])

    expect(cards[0]).toHaveClass('mc-card--open')
    expect(cards[1]).toHaveClass('mc-card--open')

    act(() => {
      vi.advanceTimersByTime(700)
    })

    // After mismatch timeout, they are hidden
    expect(cards[0]).not.toHaveClass('mc-card--open')
    expect(cards[1]).not.toHaveClass('mc-card--open')
    expect(screen.getAllByText('0/8')[0]).toBeInTheDocument()
  })

  it('does not allow flipping a card already flipped or matched', () => {
    const { container } = render(<MemoryCards />)
    const cards = container.querySelectorAll('.mc-card')

    fireEvent.click(cards[0])
    expect(cards[0]).toHaveClass('mc-card--open')

    // Click same card again should do nothing
    fireEvent.click(cards[0])

    fireEvent.click(cards[8]) // match

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(cards[0]).toHaveClass('mc-card--done')

    // Clicking done card should do nothing
    fireEvent.click(cards[0])
  })

  it('handles winning the game', () => {
    const { container } = render(<MemoryCards />)
    const cards = container.querySelectorAll('.mc-card')

    for (let i = 0; i < 8; i++) {
      fireEvent.click(cards[i])
      fireEvent.click(cards[i + 8])
      act(() => {
        vi.advanceTimersByTime(500)
      })
    }

    expect(screen.getByText(/Solved in 8 moves!/)).toBeInTheDocument()
    expect(screen.getAllByText('8/8')[0]).toBeInTheDocument()
  })

  it('resets the game correctly', () => {
    const { container } = render(<MemoryCards />)
    const cards = container.querySelectorAll('.mc-card')

    // make a move
    fireEvent.click(cards[0])
    fireEvent.click(cards[1])

    act(() => {
      vi.advanceTimersByTime(700)
    })

    const newGameBtn = screen.getAllByText('🔄 New Game')[0]
    fireEvent.click(newGameBtn)

    expect(screen.getAllByText('0/8')[0]).toBeInTheDocument()
  })
})
