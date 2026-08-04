import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import TypingAttack from '../../src/games/TypingAttack';

describe('TypingAttack', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    let randomValues = [0, 0.1, 0.2, 0.3, 0.4, 0.5];
    let randomIndex = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => {
      return randomValues[randomIndex++ % randomValues.length];
    });
    let time = 1000000000000;
    vi.spyOn(Date, 'now').mockImplementation(() => {
      time += 1;
      return time;
    });
  });

  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders the initial overlay correctly', () => {
    const { container } = render(<TypingAttack />);
    expect(container.querySelector('.ta-overlay')).toBeInTheDocument();
    expect(screen.getByText('▶ Start Attack')).toBeInTheDocument();
  });

  it('starts the game and spawns a word', () => {
    const { container } = render(<TypingAttack />);
    act(() => {
      fireEvent.click(screen.getByText('▶ Start Attack'));
    });

    const input = container.querySelector('.ta-input');
    expect(input).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3300);
    });

    expect(container.querySelector('.ta-e-word')).toHaveTextContent('JAVASCRIPT');
  });

  it('handles correct typing input', () => {
    const { container } = render(<TypingAttack />);
    act(() => {
      fireEvent.click(screen.getByText('▶ Start Attack'));
    });

    act(() => {
      vi.advanceTimersByTime(3300);
    });

    expect(container.querySelector('.ta-enemy')).toBeInTheDocument();
    const input = container.querySelector('.ta-input');

    act(() => {
      fireEvent.change(input, { target: { value: 'JAVASCRIPT' } });
    });

    // We must advance timers a bit because there's a setTimeout for the hit animation
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(container.querySelector('.ta-enemy')).not.toBeInTheDocument();

    const scoreVal = Array.from(container.querySelectorAll('.ta-chip-val')).find(
      el => el.previousSibling.textContent === 'Score'
    );
    expect(scoreVal).toHaveTextContent('100');
  });

  it('handles losing lives and game over', () => {
    const { container } = render(<TypingAttack />);
    act(() => {
      fireEvent.click(screen.getByText('▶ Start Attack'));
    });

    // Advance 20000ms by steps of 1000ms
    for(let i = 0; i < 20; i++) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }

    expect(container.querySelector('.ta-overlay-icon')).toHaveTextContent('💀');
    expect(screen.getByText('🔄 Try Again')).toBeInTheDocument();
  });

  it('resets game when clicking Try Again', () => {
    const { container } = render(<TypingAttack />);
    act(() => {
      fireEvent.click(screen.getByText('▶ Start Attack'));
    });

    for(let i = 0; i < 20; i++) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }

    expect(screen.getByText('🔄 Try Again')).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByText('🔄 Try Again'));
    });

    expect(container.querySelector('.ta-input')).toBeInTheDocument();
    expect(container.querySelectorAll('.ta-heart--empty').length).toBe(0);
  });
});
