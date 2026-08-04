import { render, screen, fireEvent, act, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import SimonSays from '../../../src/games/SimonSays'

describe('SimonSays Game', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.clearAllTimers()
  })

  it('renders initial state correctly', () => {
    render(<SimonSays />)
    expect(screen.getByText('Press Start to Play')).toBeInTheDocument()
    expect(screen.getByText('🎮 Start Game')).toBeInTheDocument()
    expect(screen.getByText('Level')).toBeInTheDocument()
    expect(screen.getByText('Best')).toBeInTheDocument()

    // Pads exist but are disabled
    const pads = screen.getAllByRole('button', { name: /red|green|blue|yellow/i })
    expect(pads).toHaveLength(4)
    pads.forEach(pad => expect(pad).toBeDisabled())
  })

  it('starts the game and plays a sequence', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0) // Always picks index 0 (Red)

    render(<SimonSays />)

    // Start the game
    const startBtn = screen.getByText('🎮 Start Game')
    fireEvent.click(startBtn)

    // Fast forward starting sequence timeout
    await act(async () => {
      vi.advanceTimersByTime(400) // Initial delay before flash
    })

    // Level 1 logic
    expect(screen.getByText('Watch carefully…')).toBeInTheDocument()

    // Fast forward timeouts
    await act(async () => {
      vi.advanceTimersByTime(500) // Initial delay before flash
    })

    // Button flashes
    const pads = screen.getAllByRole('button', { name: /red|green|blue|yellow/i })
    expect(pads[0]).toHaveStyle({ background: 'rgb(248, 113, 113)' }) // Red is active

    await act(async () => {
      vi.advanceTimersByTime(550) // Flash duration
    })

    // Now in input phase
    expect(screen.getByText('Your turn! Repeat the sequence.')).toBeInTheDocument()

    // Click the pad
    fireEvent.click(pads[0])

    await act(async () => {
      vi.advanceTimersByTime(200) // Click active timeout
    })

    expect(screen.getByText('✅ Correct! Next level…')).toBeInTheDocument()

    // Next Level timeout (is 900)
    await act(async () => {
      vi.advanceTimersByTime(900)
    })

    // Then there is a nextLevel setTimeout flash logic (is 600)
    await act(async () => {
      vi.advanceTimersByTime(600)
    })

    expect(screen.getByText('Watch carefully…')).toBeInTheDocument()

    vi.spyOn(Math, 'random').mockRestore()
  })

  it('handles game over correctly', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0) // Picks Red
    render(<SimonSays />)
    fireEvent.click(screen.getByText('🎮 Start Game'))

    // startGame timeout (400)
    await act(async () => {
      vi.advanceTimersByTime(400)
    })

    // flash timeout 1 (500)
    await act(async () => {
      vi.advanceTimersByTime(500)
    })

    // flash timeout 2 (550)
    await act(async () => {
      vi.advanceTimersByTime(550)
    })

    const pads = screen.getAllByRole('button', { name: /red|green|blue|yellow/i })

    // Check that we are indeed in input phase and buttons are not disabled
    expect(pads[1]).not.toBeDisabled()

    // Click wrong pad (Green)
    fireEvent.click(pads[1])

    expect(screen.getByText('❌ Game over! Reached level 1')).toBeInTheDocument()
    expect(screen.getByText('🔄 Restart')).toBeInTheDocument()

    // Restart logic
    fireEvent.click(screen.getByText('🔄 Restart'))
    expect(screen.getByText('Level')).toBeInTheDocument()

    vi.spyOn(Math, 'random').mockRestore()
  })
})
