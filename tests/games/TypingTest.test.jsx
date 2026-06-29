import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import TypingTest from '../../src/games/TypingTest';

const mockText = "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.";

describe('TypingTest', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.spyOn(Math, 'random').mockReturnValue(0);
    vi.spyOn(Date, 'now').mockReturnValue(1000000000000); // 1,000,000,000,000
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('calculates 100% accuracy and correct WPM for perfect typing', () => {
    render(<TypingTest />);

    act(() => {
      fireEvent.click(screen.getAllByText('▶ Start Test')[0]);
    });

    const newNow = 1000000000000 + 12000;
    vi.spyOn(Date, 'now').mockReturnValue(newNow);

    const input = screen.getAllByRole('textbox')[0];

    act(() => {
      fireEvent.change(input, { target: { value: 'The q' } });
    });

    expect(screen.getAllByText('Acc')[0].nextSibling.textContent).toBe('100%');
    expect(screen.getAllByText('WPM')[0].nextSibling.textContent).toBe('5');
  });

  it('calculates reduced accuracy and WPM for incorrect typing', () => {
    render(<TypingTest />);

    act(() => {
      fireEvent.click(screen.getAllByText('▶ Start Test')[0]);
    });

    const newNow = 1000000000000 + 12000;
    vi.spyOn(Date, 'now').mockReturnValue(newNow);

    const input = screen.getAllByRole('textbox')[0];

    act(() => {
      fireEvent.change(input, { target: { value: 'Thx q' } });
    });

    expect(screen.getAllByText('Acc')[0].nextSibling.textContent).toBe('80%');
    expect(screen.getAllByText('WPM')[0].nextSibling.textContent).toBe('4');
  });

  it('handles completion of the text correctly', () => {
    render(<TypingTest />);
    act(() => {
      fireEvent.click(screen.getAllByText('▶ Start Test')[0]);
    });

    const newNow = 1000000000000 + 60000; // 1 minute
    vi.spyOn(Date, 'now').mockReturnValue(newNow);

    const input = screen.getAllByRole('textbox')[0];

    act(() => {
      fireEvent.change(input, { target: { value: mockText } });
    });

    expect(screen.getAllByText('100%')[0]).toBeInTheDocument();
    expect(screen.getAllByText('🔄 Try Again')[0]).toBeInTheDocument();
  });
});
