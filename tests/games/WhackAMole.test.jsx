import React from 'react';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import WhackAMole from '../../src/games/WhackAMole';

describe('WhackAMole Game', () => {
  let randomMock;
  const mockRandomValues = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
  let randomMockIndex = 0;

  beforeEach(() => {
    vi.useFakeTimers();
    randomMockIndex = 0;
    randomMock = vi.spyOn(Math, 'random').mockImplementation(() => {
      const val = mockRandomValues[randomMockIndex % mockRandomValues.length];
      randomMockIndex++;
      return val;
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    randomMock.mockRestore();
    cleanup();
  });

  it('renders initial state correctly', () => {
    const { container } = render(<WhackAMole />);
    expect(screen.getByText('Score')).toBeInTheDocument();
    expect(screen.getAllByText('0')[0]).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('30s')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /▶ Start Game/i })).toBeInTheDocument();
  });

  it('starts the game and activates a mole', () => {
    const { container } = render(<WhackAMole />);
    const startButton = screen.getByRole('button', { name: /▶ Start Game/i });
    fireEvent.click(startButton);

    expect(screen.getByRole('button', { name: /…Playing/i })).toBeDisabled();

    act(() => {
      vi.advanceTimersByTime(900);
    });

    const holes = container.querySelectorAll('.wam-hole');
    expect(holes.length).toBe(16);
    expect(holes[0]).toHaveClass('wam-hole--active');
    expect(holes[0].querySelector('.wam-mole').textContent).toBe('🐹');
  });

  it('increases score and shows hit when clicking an active mole', () => {
    const { container } = render(<WhackAMole />);
    fireEvent.click(screen.getByRole('button', { name: /▶ Start Game/i }));

    act(() => {
      vi.advanceTimersByTime(900);
    });

    const holes = container.querySelectorAll('.wam-hole');
    expect(holes[0]).toHaveClass('wam-hole--active');

    fireEvent.click(holes[0]);

    expect(holes[0]).toHaveClass('wam-hole--hit');
    expect(holes[0].querySelector('.wam-hit-burst')).toBeInTheDocument();

    const scoreChip = screen.getByText('Score').parentElement;
    expect(scoreChip.querySelector('.wam-chip-val').textContent).toBe('1');
  });

  it('does not increase score and shows miss when clicking an inactive mole', () => {
    const { container } = render(<WhackAMole />);
    fireEvent.click(screen.getByRole('button', { name: /▶ Start Game/i }));

    act(() => {
      vi.advanceTimersByTime(900);
    });

    const holes = container.querySelectorAll('.wam-hole');

    // Hole 0 is active, click Hole 1
    fireEvent.click(holes[1]);

    expect(holes[1]).toHaveClass('wam-hole--miss');
    const scoreChip = screen.getByText('Score').parentElement;
    expect(scoreChip.querySelector('.wam-chip-val').textContent).toBe('0');
  });

  it('ends game after 30 seconds and updates best score', () => {
    const { container } = render(<WhackAMole />);
    fireEvent.click(screen.getByRole('button', { name: /▶ Start Game/i }));

    act(() => {
      vi.advanceTimersByTime(900);
    });

    const holes = container.querySelectorAll('.wam-hole');
    fireEvent.click(holes[0]);

    act(() => {
      vi.advanceTimersByTime(30000);
    });

    expect(screen.getByText(/Final Score:/)).toBeInTheDocument();
    const bestChip = screen.getByText('Best').parentElement;
    expect(bestChip.querySelector('.wam-chip-val').textContent).toBe('1');
    expect(screen.getByRole('button', { name: /🔄 Play Again/i })).toBeInTheDocument();
  });

  it('increases speed when score reaches multiples of 5', () => {
    const { container } = render(<WhackAMole />);
    fireEvent.click(screen.getByRole('button', { name: /▶ Start Game/i }));

    let speedChip = screen.getByText('Speed').parentElement;
    expect(speedChip.querySelector('.wam-chip-val').textContent).toBe('1.1/s');

    for (let i = 0; i < 5; i++) {
      act(() => {
        vi.advanceTimersByTime(900); // 900 initially, decreases later, but just advancing enough to trigger next
      });
      const activeHole = container.querySelector('.wam-hole--active');
      if (activeHole) {
        fireEvent.click(activeHole);
      }
    }

    speedChip = screen.getByText('Speed').parentElement;
    expect(speedChip.querySelector('.wam-chip-val').textContent).toBe('1.2/s');
  });
});
