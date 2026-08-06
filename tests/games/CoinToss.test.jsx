import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import CoinToss from '../../src/games/CoinToss';

describe('CoinToss', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.spyOn(Math, 'random').mockReturnValue(0);
    vi.spyOn(Date, 'now').mockReturnValue(1000000000000);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    cleanup();
  });

  it('renders correctly with initial state', () => {
    render(<CoinToss />);

    // Check scoreboard
    expect(screen.getByText('0W – 0L')).toBeInTheDocument();

    // Check buttons
    expect(screen.getByText('🌟 Heads')).toBeInTheDocument();
    expect(screen.getByText('🌙 Tails')).toBeInTheDocument();
  });

  it('allows user to pick Heads and win', () => {
    // Math.random() < 0.5 means outcome is Heads
    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    render(<CoinToss />);

    const headsButton = screen.getByText('🌟 Heads');

    act(() => {
      fireEvent.click(headsButton);
    });

    // Total 14 intervals * 80ms = 1120ms. Let's advance by 1500 to be safe.
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText('🎉 You Won!')).toBeInTheDocument();
    expect(screen.getByText('1W – 0L')).toBeInTheDocument();
  });

  it('allows user to pick Tails and lose', () => {
    // Math.random() < 0.5 means outcome is Heads
    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    render(<CoinToss />);

    const tailsButton = screen.getByText('🌙 Tails');

    act(() => {
      fireEvent.click(tailsButton);
    });

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText('💀 You Lost!')).toBeInTheDocument();
    expect(screen.getByText('0W – 1L')).toBeInTheDocument();
  });

  it('updates streak and history on multiple wins', () => {
    // Math.random() < 0.5 means outcome is Heads
    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    render(<CoinToss />);

    const headsButton = screen.getByText('🌟 Heads');

    // First win
    act(() => {
      fireEvent.click(headsButton);
    });
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText('1W – 0L')).toBeInTheDocument();

    // Second win
    act(() => {
      fireEvent.click(headsButton);
    });
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText('2W – 0L')).toBeInTheDocument();
    expect(screen.getByText('🔥 2-streak!')).toBeInTheDocument();
  });
});
