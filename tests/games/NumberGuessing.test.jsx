import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import NumberGuessing from '../../src/games/NumberGuessing';

describe('NumberGuessing Game', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    // Math.random() * 100 + 1 = 50 when random returns 0.49
    vi.spyOn(Math, 'random').mockReturnValue(0.49);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    cleanup();
  });

  it('renders initial state correctly', () => {
    render(<NumberGuessing />);

    expect(screen.getByText('Wins')).toBeInTheDocument();
    expect(screen.getByText('Losses')).toBeInTheDocument();
    expect(screen.getByText('Tries left')).toBeInTheDocument();

    // Check initial message
    expect(screen.getByText('🔢 Guess a number between 1 and 100')).toBeInTheDocument();

    // Check values (0 wins, 0 losses, 7 tries)
    const vals = screen.getAllByText(/^(0|7)$/);
    expect(vals.length).toBeGreaterThanOrEqual(3);

    // Check buttons
    expect(screen.getByText('Guess')).toBeInTheDocument();
    expect(screen.getByText('New Number')).toBeInTheDocument();
    expect(screen.getByText('Reset Score')).toBeInTheDocument();
  });

  it('handles low and high guesses', () => {
    render(<NumberGuessing />);
    const input = screen.getByPlaceholderText('1 – 100');
    const guessBtn = screen.getByText('Guess');

    // Guess low
    fireEvent.change(input, { target: { value: '30' } });
    fireEvent.click(guessBtn);
    expect(screen.getByText('⬆️ Too low — go higher!')).toBeInTheDocument();

    // Guess high
    fireEvent.change(input, { target: { value: '70' } });
    fireEvent.click(guessBtn);
    expect(screen.getByText('⬇️ Too high — go lower!')).toBeInTheDocument();
  });

  it('handles winning game', () => {
    render(<NumberGuessing />);
    const input = screen.getByPlaceholderText('1 – 100');
    const guessBtn = screen.getByText('Guess');

    fireEvent.change(input, { target: { value: '50' } });
    fireEvent.click(guessBtn);

    expect(screen.getByText('🎉 Correct! It was 50!')).toBeInTheDocument();
    expect(screen.getByText('🎉 Found in 1 try!')).toBeInTheDocument();

    // The score should be updated. Wins=1. Wait for auto-reset.
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Check it reset (goes back to idle message)
    expect(screen.getByText('🔢 Guess a number between 1 and 100')).toBeInTheDocument();
  });

  it('handles losing game', () => {
    render(<NumberGuessing />);
    const input = screen.getByPlaceholderText('1 – 100');
    const guessBtn = screen.getByText('Guess');

    // Make 7 wrong guesses
    for (let i = 0; i < 7; i++) {
      fireEvent.change(input, { target: { value: '10' } });
      fireEvent.click(guessBtn);
    }

    expect(screen.getByText('💀 Out of tries! It was 50.')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(screen.getByText('🔢 Guess a number between 1 and 100')).toBeInTheDocument();
  });

  it('handles manual resets', () => {
    render(<NumberGuessing />);

    // Win once to get score > 0
    const input = screen.getByPlaceholderText('1 – 100');
    const guessBtn = screen.getByText('Guess');
    fireEvent.change(input, { target: { value: '50' } });
    fireEvent.click(guessBtn);
    act(() => { vi.advanceTimersByTime(2000); });

    // Now we have 1 win. Try "New Number"
    const newNumberBtn = screen.getByText('New Number');
    fireEvent.click(newNumberBtn);

    // Test that Reset Score actually resets the score
    const resetScoreBtn = screen.getByText('Reset Score');
    fireEvent.click(resetScoreBtn);

    // Ensure "1" win is gone, everything is back to 0
    // We check that there are no "1" in the stat pill values
    // Using a more robust check:
    const pills = screen.getAllByText(/^(0|7)$/);
    expect(pills.length).toBeGreaterThanOrEqual(3);
  });
});
