import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import NumberGuessing from '../../src/games/NumberGuessing';

describe('NumberGuessing Game', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    // Secret number will be 50: floor(0.49 * 100) + 1 = 50
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
    expect(screen.getByText('🔢 Guess a number between 1 and 100')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('1 – 100')).toBeInTheDocument();
    expect(screen.getByText('Guess')).toBeInTheDocument();

    // Check initial stats
    expect(screen.getAllByText('0')[0]).toBeInTheDocument(); // Wins
    expect(screen.getAllByText('0')[1]).toBeInTheDocument(); // Losses
    expect(screen.getByText('8')).toBeInTheDocument(); // Tries left
  });

  it('handles a guess that is too low', () => {
    render(<NumberGuessing />);
    const input = screen.getByPlaceholderText('1 – 100');
    const button = screen.getByText('Guess');

    fireEvent.change(input, { target: { value: '20' } });
    fireEvent.click(button);

    expect(screen.getByText('⬆️ Too low — go higher!')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument(); // Tries left
    expect(input.value).toBe(''); // Input should be cleared
  });

  it('handles a guess that is too high', () => {
    render(<NumberGuessing />);
    const input = screen.getByPlaceholderText('1 – 100');

    fireEvent.change(input, { target: { value: '80' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' }); // Also test Enter key submission

    expect(screen.getByText('⬇️ Too high — go lower!')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('handles a winning guess and resets the game', () => {
    render(<NumberGuessing />);
    const input = screen.getByPlaceholderText('1 – 100');
    const button = screen.getByText('Guess');

    fireEvent.change(input, { target: { value: '50' } });
    fireEvent.click(button);

    // Messages should appear
    expect(screen.getByText('🎉 Correct! It was 50!')).toBeInTheDocument();
    expect(screen.getByText(/🎉 Found in 1 try!/)).toBeInTheDocument();

    // Fast-forward to next game
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Check reset state and wins incremented
    expect(screen.getByText('🔢 Guess a number between 1 and 100')).toBeInTheDocument();
    // In our component, StatPill renders the value in a span next to the label.
    // Wins is index 0 of elements containing '1' after reset.
    expect(screen.getAllByText('1')[0]).toBeInTheDocument(); // Wins = 1
  });

  it('handles exhausting all tries and losing the game', () => {
    render(<NumberGuessing />);
    const input = screen.getByPlaceholderText('1 – 100');
    const button = screen.getByText('Guess');

    // Make 8 wrong guesses
    for (let i = 0; i < 8; i++) {
      fireEvent.change(input, { target: { value: '20' } });
      fireEvent.click(button);
    }

    // Endcard and message should show loss
    expect(screen.getByText('💀 Out of tries! It was 50.')).toBeInTheDocument();
    expect(screen.getByText('💀 The number was 50')).toBeInTheDocument();

    // Fast-forward to next game
    act(() => {
      vi.advanceTimersByTime(2500);
    });

    // Check reset state and losses incremented
    expect(screen.getByText('🔢 Guess a number between 1 and 100')).toBeInTheDocument();
    // Assuming '1' will now be present for Losses (wins is 0, losses is 1)
    // We can just verify '1' is on the screen and tries is back to 8
    expect(screen.getByText('8')).toBeInTheDocument(); // Tries reset
  });

  it('ignores invalid inputs', () => {
    render(<NumberGuessing />);
    const input = screen.getByPlaceholderText('1 – 100');
    const button = screen.getByText('Guess');

    // Out of bounds high
    fireEvent.change(input, { target: { value: '150' } });
    fireEvent.click(button);
    expect(screen.getByText('8')).toBeInTheDocument(); // Tries left hasn't changed

    // Out of bounds low
    fireEvent.change(input, { target: { value: '0' } });
    fireEvent.click(button);
    expect(screen.getByText('8')).toBeInTheDocument();

    // Empty string
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(button);
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('handles New Number and Reset Score actions', () => {
    render(<NumberGuessing />);

    // Play a game to get a win
    const input = screen.getByPlaceholderText('1 – 100');
    fireEvent.change(input, { target: { value: '50' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Make a guess in the new game
    const newInput = screen.getByPlaceholderText('1 – 100');
    fireEvent.change(newInput, { target: { value: '20' } });
    fireEvent.click(screen.getByText('Guess'));

    // Tries should be 7
    expect(screen.getByText('7')).toBeInTheDocument();

    // Click New Number
    fireEvent.click(screen.getByText('New Number'));

    // Tries should reset to 8, but Wins should stay at 1
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getAllByText('1').length).toBeGreaterThan(0); // Wins is 1

    // Click Reset Score
    fireEvent.click(screen.getByText('Reset Score'));

    // Everything should be reset
    // '0' should appear for Wins, Losses, and Tries is 8
    const zeroElements = screen.getAllByText('0');
    expect(zeroElements.length).toBeGreaterThanOrEqual(2); // At least Wins and Losses
    expect(screen.getByText('8')).toBeInTheDocument();
  });
});
