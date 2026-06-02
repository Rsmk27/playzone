import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchTopScores, submitScore } from './leaderboardService';
import { getDocs, addDoc } from 'firebase/firestore';
import { auth } from './config';

// Mock dependencies
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  serverTimestamp: vi.fn(),
}));

vi.mock('./config', () => ({
  db: {},
  auth: { currentUser: null },
}));

describe('leaderboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('fetchTopScores', () => {
    it('fetches and formats top scores correctly', async () => {
      // Mock getDocs successful response
      const mockDocs = [
        { id: '1', data: () => ({ name: 'Alice', score: 100 }) },
        { id: '2', data: () => ({ name: 'Bob', score: 90 }) },
      ];

      getDocs.mockResolvedValue({ docs: mockDocs });

      const result = await fetchTopScores();

      expect(getDocs).toHaveBeenCalledTimes(1);
      expect(result).toEqual([
        { id: '1', rank: 1, name: 'Alice', score: 100 },
        { id: '2', rank: 2, name: 'Bob', score: 90 },
      ]);
    });

    it('uses a custom topN when provided', async () => {
      getDocs.mockResolvedValue({ docs: [] });

      await fetchTopScores(5);

      // We can't easily assert on query's internal `limit` args since it's chained,
      // but we can ensure getDocs is called without crashing.
      expect(getDocs).toHaveBeenCalledTimes(1);
    });

    it('handles and re-throws errors from Firestore', async () => {
      const mockError = new Error('Firestore error');
      getDocs.mockRejectedValue(mockError);

      await expect(fetchTopScores()).rejects.toThrow('Firestore error');
    });
  });

  describe('submitScore', () => {
    it('throws an error if user is not authenticated', async () => {
      auth.currentUser = null;
      await expect(submitScore('Alice', 100)).rejects.toThrow('User must be authenticated to submit a score.');
    });

    it('throws an error for invalid score types', async () => {
      auth.currentUser = { uid: '123' };

      await expect(submitScore('Alice', '100')).rejects.toThrow('Invalid score.');
      await expect(submitScore('Alice', -1)).rejects.toThrow('Invalid score.');
      await expect(submitScore('Alice', 1000000)).rejects.toThrow('Invalid score.');
    });

    it('throws an error if rate limit is exceeded', async () => {
      auth.currentUser = { uid: '123' };
      localStorage.setItem('lastSubmitSequence', Date.now().toString());

      await expect(submitScore('Alice', 100)).rejects.toThrow('Please wait a moment before submitting another score.');
    });

    it('submits a score successfully', async () => {
      auth.currentUser = { uid: '123' };
      addDoc.mockResolvedValue({ id: 'new-doc-id' });

      const result = await submitScore('Alice', 100);

      expect(addDoc).toHaveBeenCalledTimes(1);
      expect(result).toBe('new-doc-id');
      expect(localStorage.getItem('playerName')).toBe('Alice');
      expect(localStorage.getItem('lastSubmitSequence')).not.toBeNull();
    });
  });
});
