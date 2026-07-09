import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import TicTacToe from '../../src/games/TicTacToe';

describe('TicTacToe', () => {
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

  it('renders correctly with an empty board and X turn', () => {
    render(<TicTacToe />);

    // Check scoreboard
    expect(screen.getByText('0 Games')).toBeInTheDocument();

    // Turn indicator has X
    const turnX = screen.getAllByText('X')[1]; // There are multiple X texts, the turn indicator is the second one usually, but we check if it is active
    expect(turnX).toHaveClass('ttt-turn-pip--active');

    // There are 9 empty cells. They don't have text, but they are buttons
    const cells = screen.getAllByRole('button').filter(el => el.classList.contains('ttt-cell'));
    expect(cells.length).toBe(9);

    // Verify action buttons
    expect(screen.getByText('🔄 New Game')).toBeInTheDocument();
    expect(screen.getByText('Reset Score')).toBeInTheDocument();
  });

  it('alternates turns between X and O upon clicking empty cells', () => {
    render(<TicTacToe />);

    const cells = screen.getAllByRole('button').filter(el => el.classList.contains('ttt-cell'));

    // Click first cell
    act(() => {
      fireEvent.click(cells[0]);
    });

    // Check if cell 0 has X (XMark is rendered as SVG)
    expect(cells[0].querySelector('svg')).toBeInTheDocument();
    expect(cells[0].classList.contains('ttt-cell--x')).toBe(true);

    // Click second cell
    act(() => {
      fireEvent.click(cells[1]);
    });

    expect(cells[1].querySelector('svg')).toBeInTheDocument();
    expect(cells[1].classList.contains('ttt-cell--o')).toBe(true);
  });

  it('does not allow overwriting an already filled cell', () => {
    render(<TicTacToe />);
    const cells = screen.getAllByRole('button').filter(el => el.classList.contains('ttt-cell'));

    // X clicks first cell
    act(() => {
      fireEvent.click(cells[0]);
    });

    expect(cells[0].classList.contains('ttt-cell--x')).toBe(true);

    // O tries to click first cell
    act(() => {
      fireEvent.click(cells[0]);
    });

    // Should still be X
    expect(cells[0].classList.contains('ttt-cell--x')).toBe(true);
    expect(cells[0].classList.contains('ttt-cell--o')).toBe(false);
  });

  it('detects a win for X and updates scoreboard', () => {
    render(<TicTacToe />);
    const cells = screen.getAllByRole('button').filter(el => el.classList.contains('ttt-cell'));

    // X: 0, O: 3, X: 1, O: 4, X: 2
    act(() => { fireEvent.click(cells[0]); }); // X
    act(() => { fireEvent.click(cells[3]); }); // O
    act(() => { fireEvent.click(cells[1]); }); // X
    act(() => { fireEvent.click(cells[4]); }); // O
    act(() => { fireEvent.click(cells[2]); }); // X

    expect(screen.getByText('🌸 X Wins!')).toBeInTheDocument();
    expect(screen.getByText('1 Games')).toBeInTheDocument();

    // Check scoreboard X value updated to 1
    // The scoreboard has label X and value 1, the value is in the next sibling roughly.
    // The ScoreCol component renders <span className="ttt-score-val">{value}</span>
    const scoreValElements = document.querySelectorAll('.ttt-score-val');
    expect(scoreValElements[0].textContent).toBe('1'); // X's score
    expect(scoreValElements[1].textContent).toBe('0'); // O's score
  });

  it('detects a draw and updates scoreboard', () => {
    render(<TicTacToe />);
    const cells = screen.getAllByRole('button').filter(el => el.classList.contains('ttt-cell'));

    // X:0, O:1, X:2, O:3, X:4, O:6, X:5, O:8, X:7
    act(() => { fireEvent.click(cells[0]); }); // X
    act(() => { fireEvent.click(cells[1]); }); // O
    act(() => { fireEvent.click(cells[2]); }); // X
    act(() => { fireEvent.click(cells[3]); }); // O
    act(() => { fireEvent.click(cells[4]); }); // X
    act(() => { fireEvent.click(cells[6]); }); // O
    act(() => { fireEvent.click(cells[5]); }); // X
    act(() => { fireEvent.click(cells[8]); }); // O
    act(() => { fireEvent.click(cells[7]); }); // X

    expect(screen.getByText("🤝 It's a Draw!")).toBeInTheDocument();
    expect(screen.getByText('1 Games')).toBeInTheDocument();
    expect(screen.getByText('🤝 1 Draw')).toBeInTheDocument();
  });

  it('resets board when New Game is clicked but keeps scores', () => {
    render(<TicTacToe />);
    const cells = screen.getAllByRole('button').filter(el => el.classList.contains('ttt-cell'));

    // Make a move
    act(() => { fireEvent.click(cells[0]); });
    expect(cells[0].classList.contains('ttt-cell--x')).toBe(true);

    // Fast-forward so burst doesn't interfere
    act(() => { vi.advanceTimersByTime(2500); });

    // Click New Game
    act(() => { fireEvent.click(screen.getByText('🔄 New Game')); });

    // Verify board is empty
    const cellsAfter = screen.getAllByRole('button').filter(el => el.classList.contains('ttt-cell'));
    expect(cellsAfter[0].classList.contains('ttt-cell--x')).toBe(false);
  });

  it('resets scores when Reset Score is clicked', () => {
    render(<TicTacToe />);
    const cells = screen.getAllByRole('button').filter(el => el.classList.contains('ttt-cell'));

    // Play a quick game to get a win
    act(() => { fireEvent.click(cells[0]); }); // X
    act(() => { fireEvent.click(cells[3]); }); // O
    act(() => { fireEvent.click(cells[1]); }); // X
    act(() => { fireEvent.click(cells[4]); }); // O
    act(() => { fireEvent.click(cells[2]); }); // X wins

    // Advance timers so board resets
    act(() => { vi.advanceTimersByTime(2500); });

    // Verify score is 1
    const scoreValElements = document.querySelectorAll('.ttt-score-val');
    expect(scoreValElements[0].textContent).toBe('1'); // X's score

    // Click Reset Score
    act(() => { fireEvent.click(screen.getByText('Reset Score')); });

    // Verify score is 0
    const newScoreValElements = document.querySelectorAll('.ttt-score-val');
    expect(newScoreValElements[0].textContent).toBe('0'); // X's score
    expect(screen.getByText('0 Games')).toBeInTheDocument();
  });
});
