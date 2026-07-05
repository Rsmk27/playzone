import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, fireEvent, act, cleanup } from '@testing-library/react';
import Checkers from '../../src/games/Checkers';

describe('Checkers Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders initial board state', () => {
    const { container } = render(<Checkers />);
    expect(container.querySelector('.chk-result').textContent).toBe('🔴 Turn');
    const cells = container.querySelectorAll('.chk-cell');
    expect(cells.length).toBe(64);
  });

  it('selects a piece and shows legal moves', () => {
    const { container } = render(<Checkers />);
    const cells = container.querySelectorAll('.chk-cell');

    // Select Red piece at (5, 0)
    act(() => {
      fireEvent.click(cells[5 * 8 + 0]);
    });

    // Check if legal moves are shown. Red piece at (5, 0) should have legal move dots.
    const legalMoveDots = container.querySelectorAll('.chk-move-dot');
    expect(legalMoveDots.length).toBeGreaterThan(0);
  });

  it('moves a piece and switches turn', () => {
    const { container } = render(<Checkers />);
    const cells = container.querySelectorAll('.chk-cell');

    // Select Red piece at (5, 0)
    act(() => {
      fireEvent.click(cells[5 * 8 + 0]);
    });

    // Move to (4, 1)
    act(() => {
      fireEvent.click(cells[4 * 8 + 1]);
    });

    // Turn should be Black
    expect(container.querySelector('.chk-result').textContent).toBe('⚫ Turn');
  });

  it('resets the game', () => {
    const { container } = render(<Checkers />);
    const cells = container.querySelectorAll('.chk-cell');

    // Select Red piece at (5, 0) and move it
    act(() => {
      fireEvent.click(cells[5 * 8 + 0]);
    });
    act(() => {
      fireEvent.click(cells[4 * 8 + 1]);
    });

    expect(container.querySelector('.chk-result').textContent).toBe('⚫ Turn');

    // Reset game
    const resetBtn = container.querySelector('.chk-btn');
    act(() => {
      fireEvent.click(resetBtn);
    });

    expect(container.querySelector('.chk-result').textContent).toBe('🔴 Turn');
  });

  it('ignores clicks on opponent pieces', () => {
    const { container } = render(<Checkers />);
    const cells = container.querySelectorAll('.chk-cell');

    // Red turn initially. Click a Black piece at (2, 1)
    act(() => {
      fireEvent.click(cells[2 * 8 + 1]);
    });

    // Should not show any legal move dots
    const dots = container.querySelectorAll('.chk-move-dot');
    expect(dots.length).toBe(0);
  });
});
