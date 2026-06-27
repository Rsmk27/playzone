import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConnectFour, { checkWin } from '../src/games/ConnectFour';

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

describe('ConnectFour Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<ConnectFour />);
    expect(container.querySelector('.cf-root')).toBeInTheDocument();
    expect(screen.getAllByText('Your turn')[0]).toBeInTheDocument();
  });

  it('allows players to drop discs and switches turns', () => {
    const { container } = render(<ConnectFour />);

    const cells = container.querySelectorAll('.cf-cell');

    // Player 1 (Red) drops in col 0
    fireEvent.click(cells[0]);

    // Check if the board state updated by checking the disc classes
    const discs = container.querySelectorAll('.cf-disc');
    // First element in bottom row is at index 35 (row 5, col 0)
    expect(discs[35]).toHaveClass('cf-disc--placed');
    expect(discs[35].getAttribute('style')).toContain('rgb(248, 113, 113)');

    // Player 2 drops in col 1 (index 36)
    fireEvent.click(cells[1]);
    expect(discs[36]).toHaveClass('cf-disc--placed');
    expect(discs[36].getAttribute('style')).toContain('rgb(251, 191, 36)');
  });

  it('detects a win and displays the correct message', () => {
    const { container } = render(<ConnectFour />);
    const cells = container.querySelectorAll('.cf-cell');

    fireEvent.click(cells[0]); // P1
    fireEvent.click(cells[1]); // P2
    fireEvent.click(cells[0]); // P1
    fireEvent.click(cells[1]); // P2
    fireEvent.click(cells[0]); // P1
    fireEvent.click(cells[1]); // P2
    fireEvent.click(cells[0]); // P1 wins

    expect(screen.getAllByText('🔴 Wins!')[0]).toBeInTheDocument();
  });

  it('resets the game when "New Game" is clicked', () => {
    const { container } = render(<ConnectFour />);
    const cells = container.querySelectorAll('.cf-cell');

    fireEvent.click(cells[0]); // P1
    fireEvent.click(cells[1]); // P2
    fireEvent.click(cells[0]); // P1
    fireEvent.click(cells[1]); // P2
    fireEvent.click(cells[0]); // P1
    fireEvent.click(cells[1]); // P2
    fireEvent.click(cells[0]); // P1 wins

    expect(screen.getAllByText('🔴 Wins!')[0]).toBeInTheDocument();

    fireEvent.click(screen.getAllByText('🔄 New Game')[0]);

    // It might still exist in the DOM or something, but we just verify 'Your turn' is back
    expect(screen.getAllByText('Your turn')[0]).toBeInTheDocument();
  });
});
