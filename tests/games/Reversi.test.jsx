import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Reversi from '../../src/games/Reversi';
import React from 'react';

describe('Reversi Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders initial board correctly', () => {
    const { container } = render(<Reversi />);

    // Board has 64 cells
    const cells = container.querySelectorAll('.rv-cell');
    expect(cells.length).toBe(64);

    // Initial pieces: 2 white (p1), 2 black (p2)
    const whitePieces = container.querySelectorAll('.rv-disc--p1');
    const blackPieces = container.querySelectorAll('.rv-disc--p2');

    expect(whitePieces.length).toBe(2);
    expect(blackPieces.length).toBe(2);

    // Initial score
    expect(screen.getByText('◯ White').nextSibling.textContent).toBe('2');
    expect(screen.getByText('● Black').nextSibling.textContent).toBe('2');
  });

  it('allows a valid move and updates the board', () => {
    const { container } = render(<Reversi />);
    const cells = container.querySelectorAll('.rv-cell');

    // Initial state
    let whitePieces = container.querySelectorAll('.rv-disc--p1');
    let blackPieces = container.querySelectorAll('.rv-disc--p2');
    expect(whitePieces.length).toBe(2);
    expect(blackPieces.length).toBe(2);

    // Find a legal move for P1 (White)
    // Board setup: (3,3)=P2, (3,4)=P1, (4,3)=P1, (4,4)=P2
    // A legal move for P1 is (2,3) because (3,3) is P2 and (4,3) is P1
    const targetCellIndex = 2 * 8 + 3; // row 2, col 3
    fireEvent.click(cells[targetCellIndex]);

    // Fast-forward timers for animations (if any)
    vi.runAllTimers();

    // After move, P1 should have 4 pieces, P2 should have 1 piece
    whitePieces = container.querySelectorAll('.rv-disc--p1');
    blackPieces = container.querySelectorAll('.rv-disc--p2');
    expect(whitePieces.length).toBe(4);
    expect(blackPieces.length).toBe(1);

    // Score updates
    expect(screen.getByText('◯ White').nextSibling.textContent).toBe('4');
    expect(screen.getByText('● Black').nextSibling.textContent).toBe('1');
  });

  it('ignores invalid moves', () => {
    const { container } = render(<Reversi />);
    const cells = container.querySelectorAll('.rv-cell');

    // Click an occupied cell (e.g., 3,3)
    const occupiedCellIndex = 3 * 8 + 3;
    fireEvent.click(cells[occupiedCellIndex]);

    // Click an empty but illegal cell (e.g., 0,0)
    const illegalCellIndex = 0;
    fireEvent.click(cells[illegalCellIndex]);

    // State should not change
    const whitePieces = container.querySelectorAll('.rv-disc--p1');
    const blackPieces = container.querySelectorAll('.rv-disc--p2');
    expect(whitePieces.length).toBe(2);
    expect(blackPieces.length).toBe(2);
  });

  it('resets the game when New Game button is clicked', () => {
    const { container } = render(<Reversi />);
    const cells = container.querySelectorAll('.rv-cell');

    // Make a move
    const targetCellIndex = 2 * 8 + 3;
    fireEvent.click(cells[targetCellIndex]);
    vi.runAllTimers();

    // Verify move was made
    let whitePieces = container.querySelectorAll('.rv-disc--p1');
    expect(whitePieces.length).toBe(4);

    // Click New Game
    const newGameBtn = screen.getByText('🔄 New Game');
    fireEvent.click(newGameBtn);

    // Board should be reset
    whitePieces = container.querySelectorAll('.rv-disc--p1');
    const blackPieces = container.querySelectorAll('.rv-disc--p2');
    expect(whitePieces.length).toBe(2);
    expect(blackPieces.length).toBe(2);
  });
});
