import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchTopScores, submitScore } from '../lib/actions/leaderboard.actions';
import { connectToDatabase } from '../lib/mongodb';
import Leaderboard from '../models/Leaderboard';

vi.mock('../lib/mongodb', () => ({
  connectToDatabase: vi.fn(),
}));

vi.mock('../models/Leaderboard', () => {
  return {
    default: {
      find: vi.fn(),
      create: vi.fn(),
    },
  };
});

describe('Leaderboard Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchTopScores', () => {
    it('should fetch top scores successfully', async () => {
      vi.mocked(connectToDatabase).mockResolvedValue(undefined as any);

      const mockScores = [
        {
          _id: '1',
          name: 'Player 1',
          score: 100,
        },
        {
          _id: '2',
          name: 'Player 2',
          score: 90,
        },
      ];

      const mockLean = vi.fn().mockResolvedValue(mockScores);
      const mockLimit = vi.fn().mockReturnValue({ lean: mockLean });
      const mockSort = vi.fn().mockReturnValue({ limit: mockLimit });
      (Leaderboard.find as any).mockReturnValue({ sort: mockSort });

      const result = await fetchTopScores(2);

      expect(connectToDatabase).toHaveBeenCalled();
      expect(Leaderboard.find).toHaveBeenCalledWith({});
      expect(mockSort).toHaveBeenCalledWith({ score: -1 });
      expect(mockLimit).toHaveBeenCalledWith(2);
      expect(mockLean).toHaveBeenCalled();

      expect(result).toEqual([
        {
          id: '1',
          rank: 1,
          name: 'Player 1',
          score: 100,
        },
        {
          id: '2',
          rank: 2,
          name: 'Player 2',
          score: 90,
        },
      ]);
    });

    it('should return empty array and log error on failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const mockError = new Error('Database error');
      vi.mocked(connectToDatabase).mockRejectedValue(mockError);

      const result = await fetchTopScores(10);

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching top scores:', mockError);
      expect(result).toEqual([]);

      consoleSpy.mockRestore();
    });
  });

  describe('submitScore', () => {
    it('should submit score successfully', async () => {
      vi.mocked(connectToDatabase).mockResolvedValue(undefined as any);

      const mockCreatedScore = {
        _id: 'new-id',
        name: 'Player 3',
        score: 80,
        userId: 'clerk123',
        createdAt: new Date(),
      };

      (Leaderboard.create as any).mockResolvedValue(mockCreatedScore);

      const result = await submitScore(' Player 3 ', 80, 'clerk123');

      expect(connectToDatabase).toHaveBeenCalled();
      expect(Leaderboard.create).toHaveBeenCalledWith({
        name: 'Player 3',
        score: 80,
        userId: 'clerk123',
        createdAt: expect.any(Date),
      });
      expect(result).toBe('new-id');
    });

    it('should throw an error if clerkId is missing', async () => {
      await expect(submitScore('Player 4', 70, '')).rejects.toThrow(
        'User must be authenticated to submit a score.'
      );
      expect(connectToDatabase).not.toHaveBeenCalled();
    });

    it('should throw an error if score is not a number', async () => {
      await expect(submitScore('Player 5', '70' as any, 'clerk123')).rejects.toThrow(
        'Invalid score.'
      );
      expect(connectToDatabase).not.toHaveBeenCalled();
    });

    it('should throw an error if score is less than 0', async () => {
      await expect(submitScore('Player 6', -10, 'clerk123')).rejects.toThrow(
        'Invalid score.'
      );
      expect(connectToDatabase).not.toHaveBeenCalled();
    });

    it('should throw an error if score is greater than 100000', async () => {
      await expect(submitScore('Player 7', 100001, 'clerk123')).rejects.toThrow(
        'Invalid score.'
      );
      expect(connectToDatabase).not.toHaveBeenCalled();
    });

    it('should throw and log error on failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const mockError = new Error('Database error');
      vi.mocked(connectToDatabase).mockRejectedValue(mockError);

      await expect(submitScore('Player 8', 50, 'clerk123')).rejects.toThrow('Database error');

      expect(consoleSpy).toHaveBeenCalledWith('Error submitting score:', mockError);

      consoleSpy.mockRestore();
    });
  });
});
