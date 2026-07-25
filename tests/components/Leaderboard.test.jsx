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

  it('handles and displays error when fetching scores fails', async () => {
    // Mock the fetchTopScores to reject with an error
    vi.mocked(fetchTopScores).mockRejectedValueOnce(new Error('Fetch failed'));

    render(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load scores.')).toBeInTheDocument();
    });
  });
});
