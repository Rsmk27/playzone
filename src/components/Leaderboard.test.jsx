import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import Leaderboard from './Leaderboard';
import { signInGlobally } from '../firebase/config';
import { fetchTopScores, submitScore } from '../firebase/leaderboardService';
import { vi } from 'vitest';

// Mock the firebase services
vi.mock('../firebase/config', () => ({
  signInGlobally: vi.fn(),
}));

vi.mock('../firebase/leaderboardService', () => ({
  fetchTopScores: vi.fn(),
  submitScore: vi.fn(),
}));

describe('Leaderboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    fetchTopScores.mockImplementation(() => {
      // Simulate fetch returning empty list at first, then updating after submit
      if (submitScore.mock.calls.length === 0) {
        return Promise.resolve([]);
      } else {
        return Promise.resolve([{ id: '1', rank: 1, name: 'Player1', score: 500 }]);
      }
    });
    render(<Leaderboard />);
    expect(screen.getByText('Loading global scores...')).toBeInTheDocument();
  });

  it('loads and displays scores', async () => {
    const mockScores = [
      { id: '1', rank: 1, name: 'Alice', score: 1000 },
      { id: '2', rank: 2, name: 'Bob', score: 800 },
    ];
    fetchTopScores.mockResolvedValue(mockScores);

    render(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('1,000')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('800')).toBeInTheDocument();
    });
  });

  it('displays empty state when no scores', async () => {
    fetchTopScores.mockResolvedValue([]);
    render(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText('Be the first to set a high score!')).toBeInTheDocument();
    });
  });

  it('handles error during initial load', async () => {
    signInGlobally.mockRejectedValue(new Error('Connection failed'));
    render(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to connect to Firebase. Check config settings.')).toBeInTheDocument();
    });
  });

  it('shows score submission form when currentScore is provided', async () => {
    fetchTopScores.mockResolvedValue([]);
    render(<Leaderboard currentScore={500} />);

    await waitFor(() => {
      expect(screen.getByText('You scored:')).toBeInTheDocument();
      expect(screen.getByText('500')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your name...')).toBeInTheDocument();
      expect(screen.getByText('Save Score')).toBeInTheDocument();
    });
  });

  it('submits a score successfully', async () => {
    fetchTopScores
      .mockResolvedValue([])
      .mockResolvedValue([{ id: '1', rank: 1, name: 'Player1', score: 500 }]);

    submitScore.mockResolvedValue({});

    render(<Leaderboard currentScore={500} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter your name...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Enter your name...');
    fireEvent.change(input, { target: { value: 'Player1' } });

    const submitBtn = screen.getByText('Save Score');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(submitScore).toHaveBeenCalledWith('Player1', 500);
    });

    await waitFor(() => {
      expect(screen.getByText('Score saved successfully! You ranked #1')).toBeInTheDocument();
    });
  });

  it('handles score submission error', async () => {
    fetchTopScores.mockResolvedValue([]);
    submitScore.mockRejectedValue(new Error('Submit failed'));

    render(<Leaderboard currentScore={500} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter your name...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Enter your name...');
    fireEvent.change(input, { target: { value: 'Player1' } });

    const submitBtn = screen.getByText('Save Score');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Submit failed')).toBeInTheDocument();
    });
  });

  it('calls onBack when close button is clicked', async () => {
    fetchTopScores.mockResolvedValue([]);
    const onBackMock = vi.fn();
    render(<Leaderboard onBack={onBackMock} />);

    await waitFor(() => {
      expect(screen.getByText('Close Leaderboard')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Close Leaderboard'));
    expect(onBackMock).toHaveBeenCalled();
  });
});
