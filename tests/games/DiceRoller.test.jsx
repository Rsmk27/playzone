import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import DiceRoller from '../../src/games/DiceRoller';

describe('DiceRoller Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock crypto.getRandomValues
    vi.stubGlobal('crypto', {
      getRandomValues: vi.fn((arr) => {
        arr[0] = 3; // Mocks roll result to 4 ( (3 % 6) + 1 )
        return arr;
      }),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    cleanup();
  });

  it('renders correctly initially', () => {
    render(<DiceRoller />);
    expect(screen.getByText('–')).toBeInTheDocument();
    expect(screen.getByText('🎲 Roll Dice')).toBeInTheDocument();
  });

  it('rolls the dice and updates history and stats', async () => {
    render(<DiceRoller />);
    const rollBtn = screen.getByText('🎲 Roll Dice');

    fireEvent.click(rollBtn);
    expect(screen.getByText('🎲 Rolling…')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(16 * 70);
    });

    expect(screen.getByText('🎲 Roll Dice')).toBeInTheDocument();

    // Test that the mock generated a 4 (multiple elements can have 4 like stat chips and history)
    expect(screen.getAllByText('4').length).toBeGreaterThan(0);

    // Stats should show up
    expect(screen.getByText('Avg')).toBeInTheDocument();
    expect(screen.getByText('4.0')).toBeInTheDocument();
    expect(screen.getByText('Rolls')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('clears history when reset button is clicked', () => {
    render(<DiceRoller />);
    const rollBtn = screen.getByText('🎲 Roll Dice');

    fireEvent.click(rollBtn);
    act(() => {
      vi.advanceTimersByTime(16 * 70);
    });

    const clearBtn = screen.getByText('Clear History');
    fireEvent.click(clearBtn);

    expect(screen.queryByText('Clear History')).not.toBeInTheDocument();
    expect(screen.queryByText('Avg')).not.toBeInTheDocument();
  });
});
