import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import ReactionTest from '../../src/games/ReactionTest';

describe('ReactionTest', () => {
  let currentTime = 0;

  beforeEach(() => {
    vi.useFakeTimers();
    currentTime = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => currentTime);
    // Mock random to be deterministic
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // delay will be 2000 + 0.5 * 3000 = 3500ms
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    cleanup();
  });

  it('renders the component with Tap to Start message', () => {
    render(React.createElement(ReactionTest));
    expect(screen.getByText('Tap to Start')).toBeTruthy();
  });

  const simulateReactionTest = async (reactionTime) => {
    render(React.createElement(ReactionTest));

    const clickZone = screen.getByText('Tap to Start').parentElement;

    // 1. Initial state (idle -> ready)
    fireEvent.click(clickZone);
    expect(screen.getByText('Wait…')).toBeTruthy();

    // 2. Wait for delay (ready -> go)
    // Delay is 2000 + Math.random() * 3000 = 3500
    act(() => {
      currentTime = 3500;
      vi.advanceTimersByTime(3500);
    });

    expect(screen.getByText('CLICK NOW!')).toBeTruthy();

    // 3. User clicks with specific reaction time (go -> result)
    act(() => {
      currentTime = 3500 + reactionTime;
      const goZone = screen.getByText('CLICK NOW!').parentElement;
      fireEvent.click(goZone);
    });
  };

  it('maps reaction time < 180 to Elite Reflexes rating', async () => {
    await simulateReactionTest(150);
    expect(screen.getByText('Elite Reflexes ⚡')).toBeTruthy();
  });

  it('maps reaction time < 230 to Great Reflexes rating', async () => {
    await simulateReactionTest(200);
    expect(screen.getByText('Great Reflexes 🦅')).toBeTruthy();
  });

  it('maps reaction time < 300 to Good Reflexes rating', async () => {
    await simulateReactionTest(280);
    expect(screen.getByText('Good Reflexes 👍')).toBeTruthy();
  });

  it('maps reaction time >= 300 to Keep Practicing rating', async () => {
    await simulateReactionTest(350);
    expect(screen.getByText('Keep Practicing 🎯')).toBeTruthy();
  });
});
