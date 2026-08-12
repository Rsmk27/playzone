import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import RockPaperScissors from '../../src/games/RockPaperScissors';

describe('RockPaperScissors', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.spyOn(Math, 'random').mockReturnValue(0);
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 100, height: 100, top: 0, left: 0, bottom: 0, right: 0,
    }));
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    cleanup();
  });

  it('renders initial state correctly', async () => {
    render(<RockPaperScissors />);
    expect(screen.getByText('Choose your weapon')).toBeInTheDocument();
    expect(screen.getByText('Rock')).toBeInTheDocument();
    expect(screen.getByText('Paper')).toBeInTheDocument();
    expect(screen.getByText('Scissors')).toBeInTheDocument();

    expect(screen.getByText('0 Rounds')).toBeInTheDocument();
  });

  it('simulates a winning scenario for the player', async () => {
    render(<RockPaperScissors />);

    vi.spyOn(Math, 'random')
      .mockReturnValue(0.99);

    act(() => {
      fireEvent.click(screen.getByText('Rock', { selector: 'span.rps-choice-label' }));
    });

    expect(screen.getByText('Get ready…')).toBeInTheDocument();


    for (let i = 0; i < 5; i++) {
      await act(async () => {
        vi.advanceTimersByTime(600);
      });
    }


    expect(screen.getByText('🎉 You Win!')).toBeInTheDocument();
    expect(screen.getByText('1 Rounds')).toBeInTheDocument();
  });

  it('simulates a losing scenario for the player', async () => {
    render(<RockPaperScissors />);

    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.5)
      .mockReturnValue(0.5);

    act(() => {
      fireEvent.click(screen.getByText('Rock', { selector: 'span.rps-choice-label' }));
    });


    for (let i = 0; i < 5; i++) {
      await act(async () => {
        vi.advanceTimersByTime(600);
      });
    }


    expect(screen.getByText('💀 CPU Wins!')).toBeInTheDocument();
    expect(screen.getByText('1 Rounds')).toBeInTheDocument();
  });

  it('simulates a draw scenario', async () => {
    render(<RockPaperScissors />);

    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.1)
      .mockReturnValue(0.5);

    act(() => {
      fireEvent.click(screen.getByText('Rock', { selector: 'span.rps-choice-label' }));
    });


    for (let i = 0; i < 5; i++) {
      await act(async () => {
        vi.advanceTimersByTime(600);
      });
    }


    expect(screen.getByText("🤝 It's a Draw!")).toBeInTheDocument();
    expect(screen.getByText('1 Rounds')).toBeInTheDocument();
  });

  it('allows playing again while keeping the score', async () => {
    render(<RockPaperScissors />);

    vi.spyOn(Math, 'random')
      .mockReturnValue(0.99);

    act(() => {
      fireEvent.click(screen.getByText('Rock', { selector: 'span.rps-choice-label' }));
    });


    for (let i = 0; i < 5; i++) {
      await act(async () => {
        vi.advanceTimersByTime(600);
      });
    }


    expect(screen.getByText('1 Rounds')).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByText('🔄 Play Again'));
    });

    expect(screen.getByText('Choose your weapon')).toBeInTheDocument();
    expect(screen.getByText('1 Rounds')).toBeInTheDocument();
  });

  it('allows resetting the score entirely', async () => {
    render(<RockPaperScissors />);

    vi.spyOn(Math, 'random')
      .mockReturnValue(0.99);

    act(() => {
      fireEvent.click(screen.getByText('Rock', { selector: 'span.rps-choice-label' }));
    });


    for (let i = 0; i < 5; i++) {
      await act(async () => {
        vi.advanceTimersByTime(600);
      });
    }


    expect(screen.getByText('1 Rounds')).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByText('Reset Score'));
    });

    expect(screen.getByText('Choose your weapon')).toBeInTheDocument();
    expect(screen.getByText('0 Rounds')).toBeInTheDocument();
  });
});
