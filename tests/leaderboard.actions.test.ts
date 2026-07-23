import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { fetchTopScores, submitScore } from '../lib/actions/leaderboard.actions';
import Leaderboard from '../models/Leaderboard';
import { connectToDatabase } from '../lib/mongodb';

vi.mock('../lib/mongodb', () => ({
  connectToDatabase: vi.fn(),
}));

// We need to mock Leaderboard properly to support chained methods like find().sort().limit().lean()
const leanMock = vi.fn();
const limitMock = vi.fn().mockReturnValue({ lean: leanMock });
const sortMock = vi.fn().mockReturnValue({ limit: limitMock });
const findMock = vi.fn().mockReturnValue({ sort: sortMock });
const createMock = vi.fn();

vi.mock('../models/Leaderboard', () => {
  return {
    default: {
      find: vi.fn(),
      create: vi.fn(),
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
          createdAt: new Date('2023-01-01T00:00:00Z'),
        },
        {
          _id: { toString: () => 'id2' },
          name: 'Player 2',
          score: 90,
          userId: 'user2',
          createdAt: new Date('2023-01-02T00:00:00Z'),
        },
        {
          _id: { toString: () => 'id3' },
          name: 'Player 3',
          score: 80,
          userId: 'user3',
          createdAt: '2023-01-03T00:00:00.000Z',
        },
      ];

      // Retrieve mocked methods to set their return values
      leanMock.mockResolvedValueOnce(mockDocs);

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
          userId: 'user1',
          createdAt: '2023-01-01T00:00:00.000Z',
        },
        {
          id: 'id2',
          rank: 2,
          name: 'Player 2',
          score: 90,
          userId: 'user2',
          createdAt: '2023-01-02T00:00:00.000Z',
        },
        {
          id: 'id3',
          rank: 3,
          name: 'Player 3',
          score: 80,
          userId: 'user3',
          createdAt: '2023-01-03T00:00:00.000Z',
        },
      ]);
    });

    it('throws error when fetching scores fails', async () => {
      const error = new Error('Find failed');

      leanMock.mockRejectedValueOnce(error);
      vi.mocked(Leaderboard.find).mockReturnValue({ sort: sortMock } as any);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      await expect(fetchTopScores()).rejects.toThrow('Find failed');
      consoleSpy.mockRestore();
    });

    it('throws error when data mapping fails', async () => {
      const mockDocs = [
        {
          name: 'Player 1',
          score: 100,
          userId: 'user1',
          createdAt: new Date('2023-01-01T00:00:00Z'),
        },
      ];

      leanMock.mockResolvedValueOnce(mockDocs);
      vi.mocked(Leaderboard.find).mockReturnValue({ sort: sortMock } as any);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      await expect(fetchTopScores()).rejects.toThrow(TypeError);
      consoleSpy.mockRestore();
    });

    it('throws error when database connection fails', async () => {
      const error = new Error('DB Connection Failed');
      vi.mocked(connectToDatabase).mockRejectedValueOnce(error);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      await expect(fetchTopScores()).rejects.toThrow('DB Connection Failed');
      consoleSpy.mockRestore();
      expect(Leaderboard.find).not.toHaveBeenCalled();
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
      consoleSpy.mockRestore();
      expect(Leaderboard.create).not.toHaveBeenCalled();
    });

    it('throws error when creating score fails', async () => {
      const error = new Error('Create failed');
      vi.mocked(Leaderboard.create).mockRejectedValueOnce(error);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      await expect(submitScore('Player', 100, 'clerk_id')).rejects.toThrow('Create failed');
      consoleSpy.mockRestore();
    });
  });
});
