import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Leaderboard from './Leaderboard';

// Mock the Firebase services
vi.mock('../firebase/config', () => ({
  signInGlobally: vi.fn(),
}));

vi.mock('../firebase/leaderboardService', () => ({
  fetchTopScores: vi.fn(),
  submitScore: vi.fn(),
}));

import { signInGlobally } from '../firebase/config';
import { fetchTopScores, submitScore } from '../firebase/leaderboardService';

describe('Leaderboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders loading state initially', async () => {
    signInGlobally.mockResolvedValue();
    fetchTopScores.mockResolvedValue([]);

    // We need to wait for the effects to finish resolving to avoid act warnings
    await act(async () => {
      render(<Leaderboard />);
    });

    expect(screen.getByText('🏆 Global Leaderboard')).toBeInTheDocument();
  });

  it('renders empty state when no scores exist', async () => {
    signInGlobally.mockResolvedValue();
    fetchTopScores.mockResolvedValue([]);

    await act(async () => {
      render(<Leaderboard />);
    });

    await waitFor(() => {
      expect(screen.getByText('Be the first to set a high score!')).toBeInTheDocument();
    });
  });

  it('renders scores correctly', async () => {
    const mockScores = [
      { id: '1', rank: 1, name: 'Alice', score: 1000 },
      { id: '2', rank: 2, name: 'Bob', score: 800 }
    ];

    signInGlobally.mockResolvedValue();
    fetchTopScores.mockResolvedValue(mockScores);

    await act(async () => {
      render(<Leaderboard />);
    });

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('1,000')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('800')).toBeInTheDocument();
    });
  });

  it('displays connection error if signInGlobally fails', async () => {
    signInGlobally.mockRejectedValue(new Error('Connection failed'));

    await act(async () => {
      render(<Leaderboard />);
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to connect to Firebase. Check config settings.')).toBeInTheDocument();
    });
  });

  it('shows score submission form when currentScore is provided', async () => {
    signInGlobally.mockResolvedValue();
    fetchTopScores.mockResolvedValue([]);

    await act(async () => {
      render(<Leaderboard currentScore={500} />);
    });

    await waitFor(() => {
      expect(screen.getByText('You scored:')).toBeInTheDocument();
      expect(screen.getByText('500')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your name...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save Score' })).toBeInTheDocument();
    });
  });

  it('handles successful score submission', async () => {
    signInGlobally.mockResolvedValue();
    fetchTopScores
      .mockResolvedValueOnce([]) // Initial load
      .mockResolvedValueOnce([{ id: '1', rank: 1, name: 'TestUser', score: 500 }]); // After submission

    submitScore.mockResolvedValue();

    await act(async () => {
      render(<Leaderboard currentScore={500} />);
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter your name...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Enter your name...');
    const submitButton = screen.getByRole('button', { name: 'Save Score' });

    await act(async () => {
      fireEvent.change(input, { target: { value: 'TestUser' } });
      fireEvent.click(submitButton);
    });

    expect(submitScore).toHaveBeenCalledWith('TestUser', 500);

    await waitFor(() => {
      expect(screen.getByText('Score saved successfully! You ranked #1')).toBeInTheDocument();
    });
  });

  it('calls onBack handler when Close Leaderboard is clicked', async () => {
    signInGlobally.mockResolvedValue();
    fetchTopScores.mockResolvedValue([]);
    const onBackMock = vi.fn();

    await act(async () => {
      render(<Leaderboard onBack={onBackMock} />);
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close Leaderboard' })).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Close Leaderboard' }));
    });

    expect(onBackMock).toHaveBeenCalled();
  });
});
