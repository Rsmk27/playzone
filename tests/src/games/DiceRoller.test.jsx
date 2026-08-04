import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import DiceRoller from '../../../src/games/DiceRoller';

describe('DiceRoller Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock crypto to always roll a 6 (array[0] = 5 % 6 = 5, + 1 = 6)
    Object.defineProperty(window, 'crypto', {
      value: {
        getRandomValues: vi.fn((array) => {
          array[0] = 5;
          return array;
        }),
      },
    });
  });

  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders initial state correctly', () => {
    render(<DiceRoller />);
    expect(screen.getByText('?')).toBeInTheDocument();
    expect(screen.getByText('–')).toBeInTheDocument();
    expect(screen.getByText('🎲 Roll Dice')).toBeInTheDocument();
    expect(screen.queryByText('Clear History')).not.toBeInTheDocument();
    expect(screen.queryByText('Avg')).not.toBeInTheDocument();
  });

  it('handles rolling logic and displays stats and history', () => {
    render(<DiceRoller />);

    const rollButton = screen.getByText('🎲 Roll Dice');

    // Start roll
    fireEvent.click(rollButton);

    // Check rolling state
    expect(screen.getByText('🎲 Rolling…')).toBeInTheDocument();
    expect(screen.getByText('🎲 Rolling…')).toBeDisabled();

    // Fast-forward interval (16 ticks * 70ms = 1120ms)
    act(() => {
      vi.advanceTimersByTime(1120);
    });

    // Check finished state
    expect(screen.getByText('🎲 Roll Dice')).toBeInTheDocument();
    expect(screen.getByText('🎲 Roll Dice')).not.toBeDisabled();

    // Result should be 6
    const numbers = screen.getAllByText('6');
    expect(numbers.length).toBeGreaterThan(0);

    // Stats should appear
    expect(screen.getByText('Avg')).toBeInTheDocument();
    expect(screen.getByText('Min')).toBeInTheDocument();
    expect(screen.getByText('Max')).toBeInTheDocument();
    expect(screen.getByText('6s')).toBeInTheDocument();
    expect(screen.getByText('Rolls')).toBeInTheDocument();

    // History should appear
    expect(screen.getByText('Clear History')).toBeInTheDocument();
  });

  it('clears history correctly', () => {
    render(<DiceRoller />);
    const rollButton = screen.getByText('🎲 Roll Dice');

    // Roll once
    fireEvent.click(rollButton);
    act(() => {
      vi.advanceTimersByTime(1120);
    });

    // Clear history
    const clearButton = screen.getByText('Clear History');
    fireEvent.click(clearButton);

    // Verify cleared state
    expect(screen.getByText('?')).toBeInTheDocument();
    expect(screen.getByText('–')).toBeInTheDocument();
    expect(screen.queryByText('Clear History')).not.toBeInTheDocument();
    expect(screen.queryByText('Avg')).not.toBeInTheDocument();
  });
});