import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import MathQuiz from '../../src/games/MathQuiz';

describe('MathQuiz', () => {
  let mathRandomSpy;

  beforeEach(() => {
    vi.useFakeTimers();
    // Always return 0, so operator is '+', a=1, b=1, answer=2
    mathRandomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('renders initial state correctly and updates timer', () => {
    render(<MathQuiz />);

    // Check initial stats
    expect(screen.getByText('Score').nextElementSibling).toHaveTextContent('0');
    expect(screen.getByText('Streak').nextElementSibling).toHaveTextContent('0');
    expect(screen.getByText('Best').nextElementSibling).toHaveTextContent('0');
    expect(screen.getByText('Time').nextElementSibling).toHaveTextContent('00:00');

    // Check question
    expect(screen.getByText('1 + 1 = ?')).toBeInTheDocument();

    // Advance timer
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('Time').nextElementSibling).toHaveTextContent('00:01');
  });

  it('handles correct answer submission', () => {
    render(<MathQuiz />);

    const input = screen.getByPlaceholderText('?');

    // Type correct answer
    fireEvent.change(input, { target: { value: '2' } });
    fireEvent.click(screen.getByText('✓ Submit'));

    // Verify score and streak updated
    expect(screen.getByText('Score').nextElementSibling).toHaveTextContent('1');
    expect(screen.getByText('Streak').nextElementSibling).toHaveTextContent('1');
    expect(screen.getByText('Best').nextElementSibling).toHaveTextContent('1');

    // Verify feedback
    expect(screen.getByText('✓ Correct!')).toBeInTheDocument();

    // Next question loaded after timeout (900ms)
    act(() => {
      vi.advanceTimersByTime(900);
    });

    // Phase reset to idle, feedback gone
    expect(screen.queryByText('✓ Correct!')).not.toBeInTheDocument();
    expect(input.value).toBe('');
  });

  it('handles wrong answer submission', () => {
    render(<MathQuiz />);

    // Get a streak first to see it reset
    const input = screen.getByPlaceholderText('?');
    fireEvent.change(input, { target: { value: '2' } });
    fireEvent.click(screen.getByText('✓ Submit'));

    // Next Q
    act(() => {
      vi.advanceTimersByTime(900);
    });

    // Type wrong answer
    fireEvent.change(input, { target: { value: '99' } });
    fireEvent.click(screen.getByText('✓ Submit'));

    // Verify streak reset, score same
    expect(screen.getByText('Score').nextElementSibling).toHaveTextContent('1');
    expect(screen.getByText('Streak').nextElementSibling).toHaveTextContent('0');

    // Verify error feedback
    expect(screen.getByText('✗ Answer: 2')).toBeInTheDocument();

    // Next Q after 1200ms
    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(screen.queryByText('✗ Answer: 2')).not.toBeInTheDocument();
  });

  it('handles skip question', () => {
    render(<MathQuiz />);

    const input = screen.getByPlaceholderText('?');
    fireEvent.change(input, { target: { value: '2' } });
    fireEvent.click(screen.getByText('✓ Submit'));

    act(() => {
      vi.advanceTimersByTime(900);
    });

    expect(screen.getByText('Score').nextElementSibling).toHaveTextContent('1');
    expect(screen.getByText('Streak').nextElementSibling).toHaveTextContent('1');

    // Mock random to generate different question (e.g. 0.5 -> ×)
    mathRandomSpy.mockReturnValue(0.5);

    fireEvent.click(screen.getByText('→ Skip'));

    // Wait for state updates
    // Actually skip doesn't have a timeout, it just calls nextQ directly
    expect(screen.getByText('Score').nextElementSibling).toHaveTextContent('1');
    expect(screen.getByText('Streak').nextElementSibling).toHaveTextContent('1');

    // Q text should change
    // 0.5 -> index 2 ('×'). a = ri(1,12) -> floor(0.5*12)+1 = 7
    // b = ri(1,12) -> floor(0.5*12)+1 = 7. answer = 49
    expect(screen.getByText('7 × 7 = ?')).toBeInTheDocument();
  });

  it('ignores empty or non-numeric input on submit', () => {
    render(<MathQuiz />);

    const input = screen.getByPlaceholderText('?');

    // Empty input
    fireEvent.click(screen.getByText('✓ Submit'));
    expect(screen.getByText('Score').nextElementSibling).toHaveTextContent('0');

    // Enter key with empty input
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(screen.getByText('Score').nextElementSibling).toHaveTextContent('0');
  });

  it('displays streak flames at streak >= 3', () => {
    render(<MathQuiz />);

    const input = screen.getByPlaceholderText('?');

    // Submit 3 correct answers
    for (let i = 0; i < 3; i++) {
      fireEvent.change(input, { target: { value: '2' } });
      fireEvent.click(screen.getByText('✓ Submit'));
      act(() => {
        vi.advanceTimersByTime(900);
      });
    }

    expect(screen.getByText('3 streak!')).toBeInTheDocument();
  });
});
