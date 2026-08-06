import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import MobileControls from '../../src/components/MobileControls';

describe('MobileControls Component', () => {
  beforeEach(() => {
    vi.spyOn(window, 'dispatchEvent');
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders all control buttons correctly', () => {
    render(<MobileControls />);
    expect(screen.getByText('↑')).toBeInTheDocument();
    expect(screen.getByText('←')).toBeInTheDocument();
    expect(screen.getByText('→')).toBeInTheDocument();
    expect(screen.getByText('↓')).toBeInTheDocument();
    expect(screen.getByText('ACT')).toBeInTheDocument();
  });

  const testCases = [
    { name: 'Up', text: '↑', keys: ['ArrowUp', 'w', 'W'] },
    { name: 'Left', text: '←', keys: ['ArrowLeft', 'a', 'A'] },
    { name: 'Right', text: '→', keys: ['ArrowRight', 'd', 'D'] },
    { name: 'Down', text: '↓', keys: ['ArrowDown', 's', 'S'] },
    { name: 'Action', text: 'ACT', keys: ['Space', ' '] },
  ];

  testCases.forEach(({ name, text, keys }) => {
    it(`simulates keydown and keyup for ${name} button`, () => {
      render(<MobileControls />);
      const button = screen.getByText(text);

      // Simulate pointer down
      fireEvent.pointerDown(button);

      // Verify keydown events
      keys.forEach((key) => {
        const keydownEvent = vi.mocked(window.dispatchEvent).mock.calls.find(
          ([e]) => e.type === 'keydown' && e.key === key
        );
        expect(keydownEvent).toBeTruthy();
        expect(keydownEvent[0]).toBeInstanceOf(KeyboardEvent);
        expect(keydownEvent[0].code).toBe(key);
      });

      // Clear mocks to cleanly test keyup
      vi.mocked(window.dispatchEvent).mockClear();

      // Simulate pointer up
      fireEvent.pointerUp(button);

      // Verify keyup events
      keys.forEach((key) => {
        const keyupEvent = vi.mocked(window.dispatchEvent).mock.calls.find(
          ([e]) => e.type === 'keyup' && e.key === key
        );
        expect(keyupEvent).toBeTruthy();
        expect(keyupEvent[0]).toBeInstanceOf(KeyboardEvent);
        expect(keyupEvent[0].code).toBe(key);
      });
    });
  });

  it('calls preventDefault on pointer events', () => {
    render(<MobileControls />);
    const button = screen.getByText('↑');

    // Create actual PointerEvent instead of Event for strictness, but standard Event with type 'pointerdown' works for React test events
    const pointerDownEvent = new Event('pointerdown', { bubbles: true, cancelable: true });
    vi.spyOn(pointerDownEvent, 'preventDefault');
    fireEvent(button, pointerDownEvent);
    expect(pointerDownEvent.preventDefault).toHaveBeenCalled();

    const pointerUpEvent = new Event('pointerup', { bubbles: true, cancelable: true });
    vi.spyOn(pointerUpEvent, 'preventDefault');
    fireEvent(button, pointerUpEvent);
    expect(pointerUpEvent.preventDefault).toHaveBeenCalled();
  });
});
