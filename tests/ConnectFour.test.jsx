import { describe, it, expect, beforeEach } from 'vitest';
import { checkWin } from '../src/games/ConnectFour';

const ROWS = 6;
const COLS = 7;
const P1 = 'red';
const P2 = 'yellow';

describe('ConnectFour checkWin', () => {
  let board;

  const emptyBoard = () => Array(ROWS).fill(null).map(() => Array(COLS).fill(null));

  beforeEach(() => {
    board = emptyBoard();
  });

  it('should return false for an empty board', () => {
    expect(checkWin(board, 0, 0, P1)).toBe(false);
  });

  it('should detect a horizontal win', () => {
    // Set up a horizontal win for P1 in the bottom row (row 5)
    board[5][1] = P1;
    board[5][2] = P1;
    board[5][3] = P1;
    board[5][4] = P1;

    // Check from the newly placed piece at (5, 4)
    expect(checkWin(board, 5, 4, P1)).toBe(true);

    // Check from another piece in the winning line
    expect(checkWin(board, 5, 2, P1)).toBe(true);

    // Check for P2 (should be false)
    expect(checkWin(board, 5, 4, P2)).toBe(false);
  });

  it('should detect a vertical win', () => {
    // Set up a vertical win for P2 in column 3
    board[5][3] = P2;
    board[4][3] = P2;
    board[3][3] = P2;
    board[2][3] = P2;

    // Check from the top piece (2, 3)
    expect(checkWin(board, 2, 3, P2)).toBe(true);

    // Check from a middle piece
    expect(checkWin(board, 4, 3, P2)).toBe(true);
  });

  it('should detect a diagonal win (bottom-left to top-right)', () => {
    // Set up diagonal win for P1
    board[5][0] = P1;
    board[4][1] = P1;
    board[3][2] = P1;
    board[2][3] = P1;

    expect(checkWin(board, 2, 3, P1)).toBe(true);
    expect(checkWin(board, 4, 1, P1)).toBe(true);
  });

  it('should detect a diagonal win (top-left to bottom-right)', () => {
    // Set up diagonal win for P2
    board[2][1] = P2;
    board[3][2] = P2;
    board[4][3] = P2;
    board[5][4] = P2;

    expect(checkWin(board, 5, 4, P2)).toBe(true);
    expect(checkWin(board, 3, 2, P2)).toBe(true);
  });

  it('should not detect a win with only 3 in a row', () => {
    board[5][0] = P1;
    board[5][1] = P1;
    board[5][2] = P1;

    expect(checkWin(board, 5, 2, P1)).toBe(false);
  });

  it('should not detect a win if the line is broken by another player', () => {
    board[5][0] = P1;
    board[5][1] = P1;
    board[5][2] = P2; // P2 interrupts
    board[5][3] = P1;
    board[5][4] = P1;

    expect(checkWin(board, 5, 4, P1)).toBe(false);
  });

  it('should handle edge of board placements safely', () => {
    board[5][6] = P1;
    expect(checkWin(board, 5, 6, P1)).toBe(false);

    board[0][0] = P2;
    expect(checkWin(board, 0, 0, P2)).toBe(false);
  });
});
