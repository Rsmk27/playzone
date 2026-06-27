import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Hangman from '../src/games/Hangman';

describe('Hangman Component', () => {
  beforeEach(() => {
    // Mock Math.random to always return 0, selecting 'JAVASCRIPT'
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders initial state correctly', () => {
    const { container } = render(<Hangman />);

    // Check score using container query because there are multiple "Score" texts (e.g. in the banner after win)
    const stats = container.querySelectorAll('.hm-stat-val');
    // First stat is Score
    expect(stats[0]).toHaveTextContent('0');

    // Second stat is Wrong
    expect(stats[1]).toHaveTextContent('0/6');

    // Check keyboard is rendered (check for some keys)
    const buttons = container.querySelectorAll('.hm-key');
    expect(buttons.length).toBe(26);
    expect(Array.from(buttons).find(b => b.textContent === 'A')).toBeInTheDocument();
    expect(Array.from(buttons).find(b => b.textContent === 'Z')).toBeInTheDocument();

    // New word button
    expect(screen.getByText('🔄 New Word')).toBeInTheDocument();
  });

  it('handles a correct guess', () => {
    const { container } = render(<Hangman />);

    const buttons = container.querySelectorAll('.hm-key');
    const buttonJ = Array.from(buttons).find(b => b.textContent === 'J');
    fireEvent.click(buttonJ);

    // Wrong guesses should still be 0/6
    const stats = container.querySelectorAll('.hm-stat-val');
    expect(stats[1]).toHaveTextContent('0/6');

    // Button should be disabled
    expect(buttonJ).toBeDisabled();

    // The letter J should be shown in the word container
    const letterContainers = container.querySelectorAll('.hm-letter');
    expect(letterContainers[0]).toHaveTextContent('J');
  });

  it('handles an incorrect guess', () => {
    const { container } = render(<Hangman />);

    const buttons = container.querySelectorAll('.hm-key');
    const buttonZ = Array.from(buttons).find(b => b.textContent === 'Z');
    fireEvent.click(buttonZ);

    // Wrong guesses should increase to 1/6
    const stats = container.querySelectorAll('.hm-stat-val');
    expect(stats[1]).toHaveTextContent('1/6');

    // Button should be disabled
    expect(buttonZ).toBeDisabled();

    // The letter container should still be empty
    const letterContainers = container.querySelectorAll('.hm-letter');
    expect(letterContainers[0]).toHaveTextContent('');
  });

  it('handles winning condition', () => {
    const { container } = render(<Hangman />);
    const buttons = container.querySelectorAll('.hm-key');

    // Guess all unique letters in 'JAVASCRIPT'
    const lettersToGuess = ['J', 'A', 'V', 'S', 'C', 'R', 'I', 'P', 'T'];

    lettersToGuess.forEach(letter => {
      const button = Array.from(buttons).find(b => b.textContent === letter);
      fireEvent.click(button);
    });

    // Should show winning banner
    expect(screen.getByText(/You Won! The word was JAVASCRIPT/i)).toBeInTheDocument();

    // Score should increase
    const stats = container.querySelectorAll('.hm-stat-val');
    expect(stats[0]).toHaveTextContent('1');

    // Buttons should be disabled after winning
    const buttonB = Array.from(buttons).find(b => b.textContent === 'B');
    expect(buttonB).toBeDisabled();
  });

  it('handles losing condition', () => {
    const { container } = render(<Hangman />);
    const buttons = container.querySelectorAll('.hm-key');

    // Guess 6 incorrect letters
    const badLetters = ['B', 'D', 'E', 'F', 'G', 'H'];

    badLetters.forEach(letter => {
      const button = Array.from(buttons).find(b => b.textContent === letter);
      fireEvent.click(button);
    });

    // Should show losing banner
    expect(screen.getByText(/Game Over! The word was/i)).toBeInTheDocument();
    expect(screen.getByText('JAVASCRIPT')).toBeInTheDocument();

    // Score should still be 0
    const stats = container.querySelectorAll('.hm-stat-val');
    expect(stats[0]).toHaveTextContent('0');

    // Buttons should be disabled after losing
    const buttonA = Array.from(buttons).find(b => b.textContent === 'A');
    expect(buttonA).toBeDisabled();
  });
});
