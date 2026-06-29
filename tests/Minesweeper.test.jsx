import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import Minesweeper from '../src/games/Minesweeper';

const ROWS = 6;
const COLS = 7;
const MINES = 10;

describe('Minesweeper', () => {
  let originalRandom;

  beforeEach(() => {
    originalRandom = Math.random;

    // predictable placing of 10 mines at [0,0] to [3,0]
    const minesCoords = [
      [0,0], [0,1], [0,2],
      [1,0], [1,1], [1,2],
      [2,0], [2,1], [2,2],
      [3,0]
    ];
    let randomValues = [];
    minesCoords.forEach(([r, c]) => {
      randomValues.push((r + 0.5) / ROWS);
      randomValues.push((c + 0.5) / COLS);
    });

    let randomIndex = 0;
    Math.random = () => {
      const val = randomValues[randomIndex % randomValues.length];
      randomIndex++;
      return val;
    };
  });

  afterEach(() => {
    Math.random = originalRandom;
    cleanup();
  });

  it('renders initial state correctly', () => {
    render(<Minesweeper />);

    expect(screen.getByText('🎮 Playing')).toBeInTheDocument();

    const valSpans = document.querySelectorAll('.ms-hud-val');
    expect(valSpans[0].textContent).toBe('10'); // 10 mines left

    const cells = document.querySelectorAll('.ms-cell');
    expect(cells.length).toBe(ROWS * COLS);
  });

  it('handles flagging and unflagging', () => {
    render(<Minesweeper />);
    const cells = document.querySelectorAll('.ms-cell');

    fireEvent.contextMenu(cells[0]);

    expect(cells[0].textContent).toBe('🚩');
    const valSpans = document.querySelectorAll('.ms-hud-val');
    expect(valSpans[0].textContent).toBe('9'); // 9 mines left

    fireEvent.contextMenu(cells[0]);
    expect(cells[0].textContent).toBe('');
    const valSpans2 = document.querySelectorAll('.ms-hud-val');
    expect(valSpans2[0].textContent).toBe('10'); // 10 mines left
  });

  it('reveals a safe cell', () => {
    render(<Minesweeper />);
    const cells = document.querySelectorAll('.ms-cell');

    const r = 3, c = 1;
    const idx = r * COLS + c;
    fireEvent.click(cells[idx]);

    expect(cells[idx]).toHaveClass('ms-cell--rev');
    expect(cells[idx].textContent).toBe('4');
  });

  it('handles flood fill on clicking an empty cell', () => {
    render(<Minesweeper />);
    const cells = document.querySelectorAll('.ms-cell');

    const r = 5, c = 6;
    const idx = r * COLS + c;
    fireEvent.click(cells[idx]);

    const revealedCells = document.querySelectorAll('.ms-cell--rev');
    expect(revealedCells.length).toBeGreaterThan(1);
  });

  it('handles game over when clicking a mine', () => {
    render(<Minesweeper />);
    const cells = document.querySelectorAll('.ms-cell');

    fireEvent.click(cells[0]);

    expect(screen.getByText(/Boom/i)).toBeInTheDocument();
    expect(cells[0]).toHaveClass('ms-cell--exploded');
  });

  it('handles win condition when all non-mine cells are revealed', () => {
    render(<Minesweeper />);
    const cells = document.querySelectorAll('.ms-cell');

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (
          (r===0 && c===0) || (r===0 && c===1) || (r===0 && c===2) ||
          (r===1 && c===0) || (r===1 && c===1) || (r===1 && c===2) ||
          (r===2 && c===0) || (r===2 && c===1) || (r===2 && c===2) ||
          (r===3 && c===0)
        ) continue;

        fireEvent.click(cells[r * COLS + c]);
      }
    }

    expect(screen.getByText(/Cleared/i)).toBeInTheDocument();
  });
});
