import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import Leaderboard from '../../src/components/Leaderboard';
import { useAuth } from '@clerk/nextjs';
import { fetchTopScores, submitScore } from '../../lib/actions/leaderboard.actions';

vi.mock('@clerk/nextjs', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../lib/actions/leaderboard.actions', () => ({
  fetchTopScores: vi.fn(),
  submitScore: vi.fn(),
}));

describe('Leaderboard Component', () => {
  const mockScores = [
    { id: '1', name: 'Alice', score: 1500, rank: 1 },
    { id: '2', name: 'Bob', score: 1000, rank: 2 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ userId: 'mock-user-id' });
    vi.mocked(fetchTopScores).mockResolvedValue(mockScores);
    vi.mocked(submitScore).mockResolvedValue('mock-score-id');
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('renders global leaderboard and fetches scores', async () => {
    render(<Leaderboard />);

    expect(screen.getByText('🏆 Global Leaderboard')).toBeInTheDocument();
    expect(screen.getByText('Loading global scores...')).toBeInTheDocument();

    await waitFor(() => {
      expect(fetchTopScores).toHaveBeenCalledWith(10);
    });

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('1,500')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('1,000')).toBeInTheDocument();
    });
  });

  it('handles score submission success', async () => {
    render(<Leaderboard currentScore={2000} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter your name...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Enter your name...');
    fireEvent.change(input, { target: { value: 'Charlie' } });

    const submitBtn = screen.getByText('Save Score');

    // Setup updated scores returned after submission
    const updatedScores = [
      { id: '3', name: 'Charlie', score: 2000, rank: 1 },
      ...mockScores.map(s => ({ ...s, rank: s.rank + 1 }))
    ];
    vi.mocked(fetchTopScores).mockResolvedValue(updatedScores);

    fireEvent.click(submitBtn);

    expect(screen.getByText('Submitting Score...')).toBeInTheDocument();

    await waitFor(() => {
      expect(submitScore).toHaveBeenCalledWith('Charlie', 2000, 'mock-user-id');
    });

    await waitFor(() => {
      expect(screen.getByText('Score saved successfully! You ranked #1')).toBeInTheDocument();
    });
  });

  it('handles score submission failure (missing-error-test)', async () => {
    render(<Leaderboard currentScore={500} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter your name...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Enter your name...');
    fireEvent.change(input, { target: { value: 'Dave' } });

    vi.mocked(submitScore).mockRejectedValueOnce(new Error('Mock failure'));

    const submitBtn = screen.getByText('Save Score');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Mock failure')).toBeInTheDocument();
    });
  });

  it('shows generic error if submission fails without message', async () => {
    render(<Leaderboard currentScore={500} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter your name...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Enter your name...');
    fireEvent.change(input, { target: { value: 'Dave' } });

    vi.mocked(submitScore).mockRejectedValueOnce({}); // no message property

    const submitBtn = screen.getByText('Save Score');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Failed to submit score.')).toBeInTheDocument();
    });
  });

  it('prompts sign in when user is not authenticated', async () => {
    vi.mocked(useAuth).mockReturnValue({ userId: null });

    render(<Leaderboard currentScore={500} />);

    expect(screen.getByText('You must be signed in to submit your score to the global leaderboard.')).toBeInTheDocument();
    expect(screen.getByText('Sign In to Save Score')).toBeInTheDocument();
  });
});
