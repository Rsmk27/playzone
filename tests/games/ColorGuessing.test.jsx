import React from 'react'
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ColorGuessing from '../../src/games/ColorGuessing'

describe('ColorGuessing Component', () => {
  let mathRandomIndex = 0;

  beforeEach(() => {
    vi.useFakeTimers()
    mathRandomIndex = 0
    // Fix infinite loop in generateOptions:
    // It loops while opts.length < 6.
    // If Math.random() always returns the same few values, randomColor() will return duplicate hex strings.
    // Since it only pushes if !opts.includes(c.hex), it will get stuck in an infinite loop!

    // Let's just return sequential unique values for up to, say, 100 calls, then loop.
    vi.spyOn(Math, 'random').mockImplementation(() => {
      const val = (mathRandomIndex % 100) / 100;
      mathRandomIndex++;
      return val;
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('renders correctly initially', () => {
    render(<ColorGuessing />)
    expect(screen.getByText('Which RGB value matches this color?')).toBeInTheDocument()
    expect(screen.getByText('Score').nextElementSibling).toHaveTextContent('0')
    expect(screen.getByText('Streak').nextElementSibling).toHaveTextContent('0')
    expect(screen.getByText('Best').nextElementSibling).toHaveTextContent('0')

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(7)
  })

  it('handles correct answer selection', () => {
    // In our sequential mock (mathRandomIndex % 100) / 100:
    // First color generated (correct color):
    // r = 0, g = 0.01 * 256 = 2, b = 0.02 * 256 = 5
    // RGB(0, 2, 5)

    render(<ColorGuessing />)

    const correctValue = 'RGB(0, 2, 5)'
    const correctButton = screen.getByText(correctValue)

    expect(correctButton).toBeDefined()

    fireEvent.click(correctButton)

    expect(screen.getByText('Score').nextElementSibling).toHaveTextContent('1')
    expect(screen.getByText('Streak').nextElementSibling).toHaveTextContent('1')
    expect(correctButton.className).toContain('cg-opt--correct')

    // We want to verify that advancing timers resets the state.
    // We need to keep mathRandomIndex deterministic for the NEXT round too, but it doesn't matter much for this test.
    act(() => {
      vi.runOnlyPendingTimers()
    })

    const newButtons = screen.getAllByRole('button').slice(0, 6)
    newButtons.forEach(btn => {
      expect(btn.className).not.toContain('cg-opt--correct')
    })
  })

  it('handles wrong answer selection', () => {
    render(<ColorGuessing />)

    // Correct color for first round is RGB(0, 2, 5)
    // Option 2 generated:
    // r = 0.03*256 = 7, g = 0.04*256 = 10, b = 0.05*256 = 12
    // RGB(7, 10, 12)

    // Setup state by clicking correct first to get streak=1
    const correctValue = 'RGB(0, 2, 5)'
    fireEvent.click(screen.getByText(correctValue))
    expect(screen.getByText('Streak').nextElementSibling).toHaveTextContent('1')

    act(() => {
      vi.runOnlyPendingTimers()
    })

    // Now in the SECOND round, let's find a known WRONG answer.
    // We don't necessarily know the exact hex without tracing mathRandomIndex,
    // but since we are mocking sequentially, we know that all generated options are distinct.
    // We can just grab all current option strings, identify the correct one for the second round,
    // and click a different one.
    // What is the correct one for round 2?
    // Round 1 used:
    // 3 calls for correct color (0,1,2)
    // 3 calls for opt2 (3,4,5)
    // 3 calls for opt3 (6,7,8)
    // 3 calls for opt4 (9,10,11)
    // 3 calls for opt5 (12,13,14)
    // 3 calls for opt6 (15,16,17)
    // Then 6 calls for sort() inside generateOptions (18-23).
    // So next round starts at index 24.
    // Correct color for round 2:
    // r = 0.24*256 = 61, g = 0.25*256 = 64, b = 0.26*256 = 66
    // RGB(61, 64, 66)

    const newButtons = screen.getAllByRole('button').slice(0, 6)
    const optionsText = newButtons.map(b => b.textContent)

    const correctRound2 = 'RGB(61, 64, 66)'
    // Find a wrong option text
    const wrongValue = optionsText.find(t => t !== correctRound2)

    const wrongButton = screen.getByText(wrongValue)

    fireEvent.click(wrongButton)

    expect(wrongButton.className).toContain('cg-opt--wrong')
    expect(screen.getByText('Streak').nextElementSibling).toHaveTextContent('0')
  })

  it('handles skip button', () => {
    render(<ColorGuessing />)

    const skipButton = screen.getByText('Skip →')

    const initialOptions = screen.getAllByRole('button').slice(0, 6).map(b => b.textContent)

    fireEvent.click(skipButton)

    const newOptions = screen.getAllByRole('button').slice(0, 6).map(b => b.textContent)

    expect(initialOptions).not.toEqual(newOptions)
  })
})
