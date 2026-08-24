import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import Leaderboard from '../../src/components/Leaderboard';
import { fetchTopScores } from '../../lib/actions/leaderboard.actions';

// Mock Clerk useAuth
vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ userId: 'test_user_id' }),
}));

// Mock leaderboard actions
vi.mock('../../lib/actions/leaderboard.actions', () => ({
  fetchTopScores: vi.fn(),
  submitScore: vi.fn(),
}));

describe('Leaderboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('displays scores successfully', async () => {
    const mockScores = [
      { id: '1', rank: 1, name: 'Player One', score: 1000 },
      { id: '2', rank: 2, name: 'Player Two', score: 500 },
    ];
    vi.mocked(fetchTopScores).mockResolvedValueOnce(mockScores);

    render(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText('Player One')).toBeInTheDocument();
      expect(screen.getByText('Player Two')).toBeInTheDocument();
    });
  });

  it('conditionally fetches top scores only if rank <= 10 after submit', async () => {
    const { submitScore } = await import('../../lib/actions/leaderboard.actions');

    // Mock submitScore to return a rank outside top 10
    vi.mocked(submitScore).mockResolvedValueOnce({ id: 'id1', rank: 15 });

    // Mock fetchTopScores so we can assert on it
    const fetchTopScoresMock = vi.mocked(fetchTopScores);
    fetchTopScoresMock.mockResolvedValue([]);

    const { getByPlaceholderText, getByText } = render(<Leaderboard currentScore={500} />);

    // Submit form
    const input = getByPlaceholderText('Enter your name...');
    const submitBtn = getByText('Save Score');

    // Wait for effect to load initial leaderboard
    await waitFor(() => {
      expect(fetchTopScoresMock).toHaveBeenCalledTimes(1);
    });

    const { fireEvent } = await import('@testing-library/react');

    fireEvent.change(input, { target: { value: 'Test Player' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(submitScore).toHaveBeenCalledWith('Test Player', 500, 'test_user_id');
    });

    // Because rank is 15, fetchTopScores should NOT be called again
    expect(fetchTopScoresMock).toHaveBeenCalledTimes(1);

    expect(screen.getByText('Score saved successfully! You ranked #15')).toBeInTheDocument();
  });

  it('handles and displays error when fetching scores fails', async () => {
    // Mock the fetchTopScores to reject with an error
    vi.mocked(fetchTopScores).mockRejectedValueOnce(new Error('Fetch failed'));

    render(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load scores.')).toBeInTheDocument();
    });
  });
});
