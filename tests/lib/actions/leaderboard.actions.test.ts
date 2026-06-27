import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { fetchTopScores, submitScore } from '../../../lib/actions/leaderboard.actions';
import Leaderboard from '../../../models/Leaderboard';
import { connectToDatabase } from '../../../lib/mongodb';

vi.mock('../../../lib/mongodb', () => ({
  connectToDatabase: vi.fn(),
}));

// We need to mock Leaderboard properly to support chained methods like find().sort().limit().lean()
vi.mock('../../../models/Leaderboard', () => {
  const leanMock = vi.fn();
  const limitMock = vi.fn().mockReturnValue({ lean: leanMock });
  const sortMock = vi.fn().mockReturnValue({ limit: limitMock });
  const findMock = vi.fn().mockReturnValue({ sort: sortMock });
  const createMock = vi.fn();

  return {
    default: {
      find: findMock,
      create: createMock,
    },
  };
});

describe('leaderboard.actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchTopScores', () => {
    it('successfully fetches and formats top scores', async () => {
      const mockDocs = [
        {
          _id: { toString: () => 'id1' },
          name: 'Player 1',
          score: 100,
          userId: 'user1',
        },
        {
          _id: { toString: () => 'id2' },
          name: 'Player 2',
          score: 90,
          userId: 'user2',
        },
      ];

      // Retrieve mocked methods to set their return values
      const leanMock = vi.fn().mockResolvedValue(mockDocs);
      const limitMock = vi.fn().mockReturnValue({ lean: leanMock });
      const sortMock = vi.fn().mockReturnValue({ limit: limitMock });

      vi.mocked(Leaderboard.find).mockReturnValue({ sort: sortMock } as any);

      const topN = 5;
      const result = await fetchTopScores(topN);

      expect(connectToDatabase).toHaveBeenCalledTimes(1);
      expect(Leaderboard.find).toHaveBeenCalledWith({});
      expect(sortMock).toHaveBeenCalledWith({ score: -1 });
      expect(limitMock).toHaveBeenCalledWith(topN);
      expect(leanMock).toHaveBeenCalledTimes(1);

      expect(result).toEqual([
        {
          id: 'id1',
          rank: 1,
          name: 'Player 1',
          score: 100,
        },
        {
          id: 'id2',
          rank: 2,
          name: 'Player 2',
          score: 90,
        },
      ]);
    });

    it('returns empty array when database connection fails', async () => {
      const error = new Error('DB Connection Failed');
      vi.mocked(connectToDatabase).mockRejectedValueOnce(error);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await fetchTopScores();
      expect(result).toEqual([]);
      expect(Leaderboard.find).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching top scores:', error);

      consoleSpy.mockRestore();
    });

    it('returns empty array when fetching scores fails', async () => {
      const error = new Error('Find failed');

      const leanMock = vi.fn().mockRejectedValueOnce(error);
      const limitMock = vi.fn().mockReturnValue({ lean: leanMock });
      const sortMock = vi.fn().mockReturnValue({ limit: limitMock });

      vi.mocked(Leaderboard.find).mockReturnValue({ sort: sortMock } as any);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await fetchTopScores();
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching top scores:', error);

      consoleSpy.mockRestore();
    });
  });

  describe('submitScore', () => {
    it('successfully submits a valid score', async () => {
      const mockScore = {
        _id: { toString: () => 'new_score_id' },
        name: 'Player 1',
        score: 150,
        userId: 'clerk_user_1',
      };

      vi.mocked(Leaderboard.create).mockResolvedValueOnce(mockScore as any);

      const result = await submitScore('Player 1', 150, 'clerk_user_1');

      expect(connectToDatabase).toHaveBeenCalledTimes(1);
      expect(Leaderboard.create).toHaveBeenCalledTimes(1);
      expect(Leaderboard.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Player 1',
        score: 150,
        userId: 'clerk_user_1',
        createdAt: expect.any(Date),
      }));
      expect(result).toBe('new_score_id');
    });

    it('trims and truncates long names', async () => {
      const longName = '  This is a very long name that exceeds twenty characters  ';
      const mockScore = {
        _id: { toString: () => 'new_score_id' },
      };

      vi.mocked(Leaderboard.create).mockResolvedValueOnce(mockScore as any);

      await submitScore(longName, 150, 'clerk_user_1');

      expect(Leaderboard.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'This is a very long ', // Expected truncated result
      }));
    });

    it('throws error if clerkId is missing', async () => {
      await expect(submitScore('Player', 100, '')).rejects.toThrow('User must be authenticated to submit a score.');
      expect(connectToDatabase).not.toHaveBeenCalled();
      expect(Leaderboard.create).not.toHaveBeenCalled();
    });

    it('throws error for invalid score types', async () => {
      await expect(submitScore('Player', '100' as any, 'clerk_id')).rejects.toThrow('Invalid score.');
      await expect(submitScore('Player', NaN, 'clerk_id')).rejects.toThrow('Invalid score.');
    });

    it('throws error for negative scores', async () => {
      await expect(submitScore('Player', -1, 'clerk_id')).rejects.toThrow('Invalid score.');
    });

    it('throws error for excessively high scores', async () => {
      await expect(submitScore('Player', 100001, 'clerk_id')).rejects.toThrow('Invalid score.');
    });

    it('throws error when database connection fails', async () => {
      const error = new Error('DB Connection Failed');
      vi.mocked(connectToDatabase).mockRejectedValueOnce(error);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(submitScore('Player', 100, 'clerk_id')).rejects.toThrow('DB Connection Failed');
      expect(Leaderboard.create).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Error submitting score:', error);

      consoleSpy.mockRestore();
    });

    it('throws error when creating score fails', async () => {
      const error = new Error('Create failed');
      vi.mocked(Leaderboard.create).mockRejectedValueOnce(error);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(submitScore('Player', 100, 'clerk_id')).rejects.toThrow('Create failed');
      expect(consoleSpy).toHaveBeenCalledWith('Error submitting score:', error);

      consoleSpy.mockRestore();
    });

    it('should truncate a name longer than 20 characters', async () => {
      const longName = 'This is a very long name that exceeds twenty characters';
      const score = 100;
      const clerkId = 'user_123';
      (Leaderboard.create as any).mockResolvedValue({ _id: { toString: () => 'new_id_123' } });

      const result = await submitScore(longName, score, clerkId);

      expect(result).toBe('new_id_123');
      expect(Leaderboard.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'This is a very long ',
        })
      );
    });

    it('should trim the name before truncating', async () => {
      const nameWithSpaces = '   This is a very long name that needs trimming   ';
      (Leaderboard.create as any).mockResolvedValue({ _id: { toString: () => 'new_id_123' } });

      await submitScore(nameWithSpaces, 100, 'user_123');

      expect(Leaderboard.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'This is a very long ' })
      );
    });

    it('should not truncate a name shorter than 20 characters', async () => {
      const shortName = 'Short Name';
      (Leaderboard.create as any).mockResolvedValue({ _id: { toString: () => 'new_id_123' } });

      await submitScore(shortName, 100, 'user_123');

      expect(Leaderboard.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Short Name' }));
    });
  });
});
