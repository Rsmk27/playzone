import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import CatchObject from '../../src/games/CatchObject';

describe('CatchObject', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
    };

    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);
    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      right: 400,
      bottom: 500,
      width: 400,
      height: 500,
    }));

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      // Just schedule the callback using setTimeout so fake timers work
      return setTimeout(cb, 16);
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      clearTimeout(id);
    });

    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders initial state correctly', () => {
    render(<CatchObject />);
    expect(screen.getByText('Score: 0')).toBeInTheDocument();
    expect(screen.getByText('Press Start to play!')).toBeInTheDocument();
    expect(screen.getByText('Start Game')).toBeInTheDocument();
  });

  it('starts the game when start button is clicked', () => {
    render(<CatchObject />);

    act(() => {
      fireEvent.click(screen.getByText('Start Game'));
    });

    expect(screen.getByText('Move mouse or use ← → arrows to catch items.')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(16);
    });
    expect(mockContext.fillRect).toHaveBeenCalled(); // Ensure the draw loop started
  });

  it('updates basket position on mouse move when playing', () => {
    const { container } = render(<CatchObject />);

    act(() => {
      fireEvent.click(screen.getByText('Start Game'));
    });

    const canvas = container.querySelector('canvas');

    act(() => {
      fireEvent.mouseMove(canvas, { clientX: 200, clientY: 250 });
      vi.advanceTimersByTime(16);
    });

    expect(mockContext.fillRect).toHaveBeenCalled();
  });

  it('updates basket position on touch move when playing', () => {
    const { container } = render(<CatchObject />);

    act(() => {
      fireEvent.click(screen.getByText('Start Game'));
    });

    const canvas = container.querySelector('canvas');

    act(() => {
      fireEvent.touchMove(canvas, { touches: [{ clientX: 200, clientY: 250 }] });
      vi.advanceTimersByTime(16);
    });

    expect(mockContext.fillRect).toHaveBeenCalled();
  });

  it('updates basket position on keyboard left/right when playing', () => {
    render(<CatchObject />);

    act(() => {
      fireEvent.click(screen.getByText('Start Game'));
    });

    act(() => {
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      vi.advanceTimersByTime(16);
    });

    expect(mockContext.fillRect).toHaveBeenCalled();

    act(() => {
      fireEvent.keyUp(window, { key: 'ArrowLeft' });
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      vi.advanceTimersByTime(16);
    });

    act(() => {
      fireEvent.keyUp(window, { key: 'ArrowRight' });
    });
  });

  it('spawns objects and handles catching them', () => {
    // Math.random < 0.02 is needed to spawn an object
    vi.spyOn(Math, 'random').mockReturnValue(0.01);

    render(<CatchObject />);

    act(() => {
      fireEvent.click(screen.getByText('Start Game'));
    });

    act(() => {
      vi.advanceTimersByTime(16); // Spawn object and start moving it
      vi.advanceTimersByTime(5000); // Wait enough time for it to fall and be caught/missed
    });

    expect(mockContext.fill).toHaveBeenCalled(); // objects are drawn with fill()
  });

  it('starts the game when space key is pressed', () => {
    render(<CatchObject />);

    act(() => {
      fireEvent.keyDown(window, { key: ' ' });
    });

    expect(screen.getByText('Move mouse or use ← → arrows to catch items.')).toBeInTheDocument();
  });
});
