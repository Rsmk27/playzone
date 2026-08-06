import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Checkers, { initBoard, getMoves, getJumps, P1, P2, P1K, P2K } from '../../src/games/Checkers';

describe('Checkers Unit Tests', () => {
  describe('initBoard', () => {
    it('initializes a correct 8x8 board', () => {
      const board = initBoard();
      expect(board.length).toBe(8);
      expect(board[0].length).toBe(8);

      // Check pieces
      expect(board[0][1]).toBe(P2); // Top rows for P2
      expect(board[1][0]).toBe(P2);
      expect(board[2][1]).toBe(P2);

      expect(board[5][0]).toBe(P1); // Bottom rows for P1
      expect(board[6][1]).toBe(P1);
      expect(board[7][0]).toBe(P1);

      // Check empty
      expect(board[3][0]).toBe(0);
      expect(board[4][1]).toBe(0);

      // Check dark vs light squares
      expect(board[0][0]).toBe(0); // Top left is 0 because (0+0)%2 is 0
    });
  });

  describe('getMoves', () => {
    it('returns valid forward moves for a normal piece (P1/Red moves up)', () => {
      const board = initBoard();
      const moves = getMoves(board, 5, 2);
      // P1 moves up (r-1).
      // Piece at 5,2 can move to 4,1 and 4,3
      expect(moves.length).toBe(2);
      expect(moves).toEqual(expect.arrayContaining([[4, 1], [4, 3]]));
    });

    it('returns valid forward moves for a normal piece (P2/Black moves down)', () => {
      const board = initBoard();
      const moves = getMoves(board, 2, 1);
      // P2 moves down (r+1).
      // Piece at 2,1 can move to 3,0 and 3,2
      expect(moves.length).toBe(2);
      expect(moves).toEqual(expect.arrayContaining([[3, 0], [3, 2]]));
    });

    it('returns backward moves for a king', () => {
      const board = Array(8).fill(null).map(() => Array(8).fill(0));
      board[4][4] = P1K; // P1 King
      const moves = getMoves(board, 4, 4);
      expect(moves.length).toBe(4);
      expect(moves).toEqual(expect.arrayContaining([[3, 3], [3, 5], [5, 3], [5, 5]]));
    });
  });

  describe('getJumps', () => {
    it('returns valid jumps', () => {
      const board = Array(8).fill(null).map(() => Array(8).fill(0));
      board[4][4] = P1;
      board[3][5] = P2; // P2 is at top right of P1

      const jumps = getJumps(board, 4, 4);
      expect(jumps.length).toBe(1);
      expect(jumps[0]).toEqual([2, 6]);
    });

    it('does not allow jumping own pieces', () => {
      const board = Array(8).fill(null).map(() => Array(8).fill(0));
      board[4][4] = P1;
      board[3][5] = P1; // P1 is at top right of P1

      const jumps = getJumps(board, 4, 4);
      expect(jumps.length).toBe(0);
    });

    it('allows king to jump backwards', () => {
      const board = Array(8).fill(null).map(() => Array(8).fill(0));
      board[4][4] = P1K;
      board[5][5] = P2; // P2 is at bottom right of P1K

      const jumps = getJumps(board, 4, 4);
      expect(jumps.length).toBe(1);
      expect(jumps[0]).toEqual([6, 6]);
    });
  });
});

describe('Checkers Component Tests', () => {
  afterEach(cleanup);

  it('renders initial board', () => {
    const { container } = render(<Checkers />);
    expect(screen.getByText('🔴 Turn')).toBeInTheDocument();

    const cells = container.querySelectorAll('.chk-cell');
    expect(cells.length).toBe(64);

    const pieces = container.querySelectorAll('.chk-piece');
    expect(pieces.length).toBe(24); // 12 P1 + 12 P2
  });

  it('can select a piece and see valid moves', () => {
    const { container } = render(<Checkers />);

    // Select P1 piece at 5,0
    const pieceSquare = container.querySelectorAll('.chk-cell')[40]; // row 5, col 0
    fireEvent.click(pieceSquare);

    // Look for legal move dots
    const dots = container.querySelectorAll('.chk-move-dot');
    expect(dots.length).toBeGreaterThan(0);
  });

  it('can make a simple move and change turns', () => {
    const { container } = render(<Checkers />);

    // P1 selects 5,2
    const fromSquare = container.querySelectorAll('.chk-cell')[42];
    fireEvent.click(fromSquare);

    // Moves to 4,1
    const toSquare = container.querySelectorAll('.chk-cell')[33];
    fireEvent.click(toSquare);

    // Check turn changed to Black
    expect(screen.getByText('⚫ Turn')).toBeInTheDocument();
  });
});
