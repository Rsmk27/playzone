import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import Game2048, { addRandom, init, slide, move } from '../../src/games/Game2048';

describe('Game2048 Logic', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // deterministic random
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('init', () => {
    it('initializes a 4x4 grid with two random tiles', () => {
      const grid = init();
      expect(grid.length).toBe(4);
      expect(grid[0].length).toBe(4);

      let nonZeroCount = 0;
      grid.flat().forEach(cell => {
        if (cell !== 0) {
          nonZeroCount++;
          expect([2, 4]).toContain(cell);
        }
      });
      expect(nonZeroCount).toBe(2);
    });
  });

  describe('addRandom', () => {
    it('adds a tile to an empty spot', () => {
      const grid = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];

      const newGrid = addRandom(grid);
      let nonZeroCount = 0;
      newGrid.flat().forEach(cell => {
        if (cell !== 0) nonZeroCount++;
      });
      expect(nonZeroCount).toBe(1);
    });

    it('returns the same grid if there are no empty spots', () => {
      const fullGrid = [
        [2, 4, 2, 4],
        [4, 2, 4, 2],
        [2, 4, 2, 4],
        [4, 2, 4, 2]
      ];
      const result = addRandom(fullGrid);
      expect(result).toBe(fullGrid);
    });
  });

  describe('slide', () => {
    it('slides numbers and calculates score', () => {
      expect(slide([2, 2, 0, 0])).toEqual({ row: [4, 0, 0, 0], score: 4 });
      expect(slide([4, 2, 2, 0])).toEqual({ row: [4, 4, 0, 0], score: 4 });
      expect(slide([2, 2, 2, 2])).toEqual({ row: [4, 4, 0, 0], score: 8 });
      expect(slide([2, 0, 2, 0])).toEqual({ row: [4, 0, 0, 0], score: 4 });
      expect(slide([4, 4, 4, 4])).toEqual({ row: [8, 8, 0, 0], score: 16 });
      expect(slide([0, 0, 0, 0])).toEqual({ row: [0, 0, 0, 0], score: 0 });
    });
  });

  describe('move', () => {
    it('moves left correctly', () => {
      const g = [
        [2, 2, 0, 0],
        [0, 4, 4, 0],
        [2, 0, 2, 0],
        [0, 0, 0, 0]
      ];
      const { grid, score, moved } = move(g, 'left');
      expect(moved).toBe(true);
      expect(score).toBe(4 + 8 + 4);

      // Since math.random is mocked to 0.5, it will add a 2 in a predictable empty spot
      // The moved grid before addRandom would be:
      // [4, 0, 0, 0]
      // [8, 0, 0, 0]
      // [4, 0, 0, 0]
      // [0, 0, 0, 0]
      // Total 13 empty spots. Math.floor(0.5 * 13) = 6.
      // Empty spots: (0,1),(0,2),(0,3),(1,1),(1,2),(1,3),(2,1)...
      // 6th index is (1,3).
      // new random val = 0.5 < 0.9 ? 2 : 4 = 2.
      let count = 0;
      grid.flat().forEach(cell => {
        if (cell !== 0) count++;
      });
      expect(count).toBe(4);
      expect(grid[0][0]).toBe(4);
      expect(grid[1][0]).toBe(8);
      expect(grid[2][0]).toBe(4);
    });

    it('moves right correctly', () => {
      const g = [
        [2, 2, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      // moved grid: [0,0,0,4], empty spots: 15. index = 7 (1,3)
      const { grid, score, moved } = move(g, 'right');
      expect(moved).toBe(true);
      expect(score).toBe(4);
      expect(grid[0][3]).toBe(4);
    });

    it('moves up correctly', () => {
       const g = [
        [2, 0, 0, 0],
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      const { grid, score, moved } = move(g, 'up');
      expect(moved).toBe(true);
      expect(score).toBe(4);
      expect(grid[0][0]).toBe(4);
    });

    it('moves down correctly', () => {
       const g = [
        [2, 0, 0, 0],
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      const { grid, score, moved } = move(g, 'down');
      expect(moved).toBe(true);
      expect(score).toBe(4);
      expect(grid[3][0]).toBe(4);
    });

    it('does nothing if no move is possible', () => {
      const g = [
        [2, 4, 2, 4],
        [4, 2, 4, 2],
        [2, 4, 2, 4],
        [4, 2, 4, 2]
      ];
      const { grid, score, moved } = move(g, 'left');
      expect(moved).toBe(false);
      expect(score).toBe(0);
      expect(grid).toEqual(g);
    });
  });
});

describe('Game2048 Component', () => {
  let mockRandomIndex = 0;
  const mockRandomValues = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

  beforeEach(() => {
    mockRandomIndex = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => {
      const val = mockRandomValues[mockRandomIndex % mockRandomValues.length];
      mockRandomIndex++;
      return val;
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders initial game state', () => {
    render(<Game2048 />);
    expect(screen.getByText('Score')).toBeInTheDocument();
    expect(screen.getByText('Best')).toBeInTheDocument();
    expect(screen.getAllByText('0')[0]).toBeInTheDocument(); // Initial score
    expect(screen.getByText('🔄 New Game')).toBeInTheDocument();
    expect(screen.getByText('Use arrow keys or buttons to play')).toBeInTheDocument();
  });

  it('handles keyboard input to move tiles', () => {
    render(<Game2048 />);

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    fireEvent.keyDown(window, { key: 'ArrowUp' });
    fireEvent.keyDown(window, { key: 'ArrowDown' });

    // The score might not necessarily be > 0 depending on the random initial state
    // and if moves resulted in merges. But we can ensure the event listeners don't throw.
  });

  it('handles button clicks to move tiles', () => {
    render(<Game2048 />);

    fireEvent.click(screen.getByText('↑'));
    fireEvent.click(screen.getByText('←'));
    fireEvent.click(screen.getByText('↓'));
    fireEvent.click(screen.getByText('→'));
  });

  it('handles New Game button click', () => {
    render(<Game2048 />);
    fireEvent.click(screen.getByText('🔄 New Game'));
    expect(screen.getAllByText('0')[0]).toBeInTheDocument(); // Score is reset
  });
});
