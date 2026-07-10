import React from "react";
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import Chess from '../../src/games/Chess';

describe('Chess Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles black pawn promotion', () => {
    const { container } = render(<Chess />);
    const cells = container.querySelectorAll('.ch-cell');

    fireEvent.click(cells[6 * 8 + 0]); fireEvent.click(cells[5 * 8 + 0]); // a2-a3
    fireEvent.click(cells[1 * 8 + 7]); fireEvent.click(cells[3 * 8 + 7]); // h7-h5
    fireEvent.click(cells[5 * 8 + 0]); fireEvent.click(cells[4 * 8 + 0]); // a3-a4
    fireEvent.click(cells[3 * 8 + 7]); fireEvent.click(cells[4 * 8 + 7]); // h5-h4
    fireEvent.click(cells[4 * 8 + 0]); fireEvent.click(cells[3 * 8 + 0]); // a4-a5
    fireEvent.click(cells[4 * 8 + 7]); fireEvent.click(cells[5 * 8 + 7]); // h4-h3
    fireEvent.click(cells[3 * 8 + 0]); fireEvent.click(cells[2 * 8 + 0]); // a5-a6
    fireEvent.click(cells[5 * 8 + 7]); fireEvent.click(cells[6 * 8 + 6]); // h3xg2
    fireEvent.click(cells[2 * 8 + 0]); fireEvent.click(cells[1 * 8 + 1]); // a6xb7
    fireEvent.click(cells[6 * 8 + 6]); fireEvent.click(cells[7 * 8 + 7]); // g2xh1=q

    // Black Queen at h1 ♛
    expect(cells[7 * 8 + 7].textContent).toBe('♛');
  });

  it('handles white pawn promotion', () => {
    const { container } = render(<Chess />);
    const cells = container.querySelectorAll('.ch-cell');

    fireEvent.click(cells[6 * 8 + 7]); fireEvent.click(cells[4 * 8 + 7]); // h2-h4
    fireEvent.click(cells[1 * 8 + 6]); fireEvent.click(cells[3 * 8 + 6]); // g7-g5
    fireEvent.click(cells[4 * 8 + 7]); fireEvent.click(cells[3 * 8 + 6]); // h4xg5
    fireEvent.click(cells[1 * 8 + 5]); fireEvent.click(cells[2 * 8 + 5]); // f7-f6
    fireEvent.click(cells[3 * 8 + 6]); fireEvent.click(cells[2 * 8 + 6]); // g5-g6
    fireEvent.click(cells[1 * 8 + 7]); fireEvent.click(cells[2 * 8 + 7]); // h7-h6
    fireEvent.click(cells[2 * 8 + 6]); fireEvent.click(cells[1 * 8 + 6]); // g6-g7
    fireEvent.click(cells[1 * 8 + 0]); fireEvent.click(cells[2 * 8 + 0]); // a7-a6
    fireEvent.click(cells[1 * 8 + 6]); fireEvent.click(cells[0 * 8 + 7]); // g7xh8=Q

    expect(cells[0 * 8 + 7].textContent).toBe('♕'); // Queen char for White is ♕
  });

  it('renders initial board state', () => {
    const { container } = render(<Chess />);
    const pill = container.querySelector('.ch-status-pill');
    expect(within(pill).getByText('♔ White')).toBeInTheDocument();

    const cells = container.querySelectorAll('.ch-cell');
    expect(cells.length).toBe(64);
  });

  it('selects a piece and shows legal moves', () => {
    const { container } = render(<Chess />);
    const cells = container.querySelectorAll('.ch-cell');

    // White's turn initially. Select white pawn at (6, 0)
    fireEvent.click(cells[6 * 8 + 0]);

    // Check if legal moves are shown. White pawn at 6,0 should move to 5,0 and 4,0.
    // Legal move dots have class ch-dot
    const dots = container.querySelectorAll('.ch-dot');
    expect(dots.length).toBeGreaterThan(0);
  });

  it('moves a piece and switches turn', () => {
    const { container } = render(<Chess />);
    const cells = container.querySelectorAll('.ch-cell');

    // White pawn at (6, 0) -> (4, 0)
    fireEvent.click(cells[6 * 8 + 0]);
    fireEvent.click(cells[4 * 8 + 0]);

    // Turn should be black
    const pill = container.querySelector('.ch-status-pill');
    expect(within(pill).getByText('♚ Black')).toBeInTheDocument();
  });

  it('resets the game', () => {
    const { container } = render(<Chess />);
    const cells = container.querySelectorAll('.ch-cell');

    // Make a move
    fireEvent.click(cells[6 * 8 + 0]);
    fireEvent.click(cells[4 * 8 + 0]);
    const pill = container.querySelector('.ch-status-pill');
    expect(within(pill).getByText('♚ Black')).toBeInTheDocument();

    // Reset
    const resetBtn = container.querySelector('button.ch-btn');
    fireEvent.click(resetBtn);
    expect(within(pill).getByText('♔ White')).toBeInTheDocument();
  });

  it('handles captures correctly', () => {
    const { container } = render(<Chess />);
    const cells = container.querySelectorAll('.ch-cell');

    // Move White pawn e2 -> e4
    fireEvent.click(cells[6 * 8 + 4]);
    fireEvent.click(cells[4 * 8 + 4]);

    // Move Black pawn d7 -> d5
    fireEvent.click(cells[1 * 8 + 3]);
    fireEvent.click(cells[3 * 8 + 3]);

    // White pawn e4 captures Black pawn d5
    fireEvent.click(cells[4 * 8 + 4]);
    fireEvent.click(cells[3 * 8 + 3]);

    // Captured pieces should update
    const capturesWhite = container.querySelector('.ch-captures--white');
    expect(within(capturesWhite).getByText('♟')).toBeInTheDocument();
  });

  it('detects checkmate/king capture', () => {
    const { container } = render(<Chess />);
    const cells = container.querySelectorAll('.ch-cell');

    // This is not standard chess logic where checkmate ends it, but king capture.
    // Let's do a fast sequence to capture black king.
    // e2-e4
    fireEvent.click(cells[6 * 8 + 4]); fireEvent.click(cells[4 * 8 + 4]);
    // f7-f6
    fireEvent.click(cells[1 * 8 + 5]); fireEvent.click(cells[2 * 8 + 5]);
    // d2-d4
    fireEvent.click(cells[6 * 8 + 3]); fireEvent.click(cells[4 * 8 + 3]);
    // g7-g5
    fireEvent.click(cells[1 * 8 + 6]); fireEvent.click(cells[3 * 8 + 6]);
    // Qh5+ (White Queen to h5)
    fireEvent.click(cells[7 * 8 + 3]); fireEvent.click(cells[3 * 8 + 7]);
    // e7-e6 (Black plays anything)
    fireEvent.click(cells[1 * 8 + 4]); fireEvent.click(cells[2 * 8 + 4]);
    // Queen captures King at e8
    fireEvent.click(cells[3 * 8 + 7]); fireEvent.click(cells[0 * 8 + 4]);

    const pill = container.querySelector('.ch-status-pill');
    expect(within(pill).getByText('White wins! ♔')).toBeInTheDocument();
  });

  it('ignores clicks when status is present (game over)', () => {
    const { container } = render(<Chess />);
    const cells = container.querySelectorAll('.ch-cell');

    // Capture black king
    fireEvent.click(cells[6 * 8 + 4]); fireEvent.click(cells[4 * 8 + 4]);
    fireEvent.click(cells[1 * 8 + 5]); fireEvent.click(cells[2 * 8 + 5]);
    fireEvent.click(cells[6 * 8 + 3]); fireEvent.click(cells[4 * 8 + 3]);
    fireEvent.click(cells[1 * 8 + 6]); fireEvent.click(cells[3 * 8 + 6]);
    fireEvent.click(cells[7 * 8 + 3]); fireEvent.click(cells[3 * 8 + 7]);
    fireEvent.click(cells[1 * 8 + 4]); fireEvent.click(cells[2 * 8 + 4]);
    fireEvent.click(cells[3 * 8 + 7]); fireEvent.click(cells[0 * 8 + 4]);

    // Game over. Now click a pawn
    fireEvent.click(cells[6 * 8 + 0]);

    // Should not show legal move dots
    const dots = container.querySelectorAll('.ch-dot');
    expect(dots.length).toBe(0);
  });

  it('detects white king capture', () => {
    const { container } = render(<Chess />);
    const cells = container.querySelectorAll('.ch-cell');

    // Fast sequence for black to capture white king.
    // f2-f3
    fireEvent.click(cells[6 * 8 + 5]); fireEvent.click(cells[5 * 8 + 5]);
    // e7-e5
    fireEvent.click(cells[1 * 8 + 4]); fireEvent.click(cells[3 * 8 + 4]);
    // g2-g4
    fireEvent.click(cells[6 * 8 + 6]); fireEvent.click(cells[4 * 8 + 6]);
    // Qh4+ (Black Queen to h4)
    fireEvent.click(cells[0 * 8 + 3]); fireEvent.click(cells[4 * 8 + 7]);
    // h2-h3 (White plays anything)
    fireEvent.click(cells[6 * 8 + 7]); fireEvent.click(cells[5 * 8 + 7]);
    // Queen captures King at e1
    fireEvent.click(cells[4 * 8 + 7]); fireEvent.click(cells[7 * 8 + 4]);

    const pill = container.querySelector('.ch-status-pill');
    expect(within(pill).getByText('Black wins! ♚')).toBeInTheDocument();
  });
});
