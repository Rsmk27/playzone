import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Leaderboard from '../src/components/Leaderboard';
import { fetchTopScores } from '../lib/actions/leaderboard.actions';

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    userId: 'user_123',
    sessionId: 'sess_123',
    getToken: vi.fn(),
  }),
}));

vi.mock('../lib/actions/leaderboard.actions', () => ({
  fetchTopScores: vi.fn(),
  submitScore: vi.fn(),
}));

describe('Leaderboard Component', () => {
  it('displays error state when fetchTopScores rejects', async () => {
    fetchTopScores.mockRejectedValueOnce(new Error('Failed to load scores.'));

    render(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load scores.')).toBeInTheDocument();
    });
  });
});
