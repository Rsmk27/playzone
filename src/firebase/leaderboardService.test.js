import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { submitScore } from './leaderboardService';
import { auth, db } from './config';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

vi.mock('./config', () => ({
  auth: { currentUser: null },
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(),
  collection: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp')
}));

describe('submitScore', () => {
  let mockStorage = {};

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
    mockStorage = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => mockStorage[key] || null),
      setItem: vi.fn((key, value) => { mockStorage[key] = value; }),
    });
    auth.currentUser = { uid: 'test-user-id' };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('throws error if user is not authenticated', async () => {
    auth.currentUser = null;
    await expect(submitScore('Alice', 100)).rejects.toThrow('User must be authenticated to submit a score.');
  });

  it('throws error if rate limited (less than 10 seconds since last submit)', async () => {
    const now = Date.now();
    mockStorage['lastSubmitSequence'] = (now - 5000).toString(); // 5 seconds ago
    await expect(submitScore('Alice', 100)).rejects.toThrow('Please wait a moment before submitting another score.');
  });

  it('throws error if score is invalid (not a number)', async () => {
    await expect(submitScore('Alice', '100')).rejects.toThrow('Invalid score.');
  });

  it('throws error if score is invalid (less than 0)', async () => {
    await expect(submitScore('Alice', -1)).rejects.toThrow('Invalid score.');
  });

  it('throws error if score is invalid (greater than 100000)', async () => {
    await expect(submitScore('Alice', 100001)).rejects.toThrow('Invalid score.');
  });

  it('successfully submits score and updates localStorage', async () => {
    addDoc.mockResolvedValueOnce({ id: 'doc-123' });
    collection.mockReturnValueOnce('mock-collection');

    const result = await submitScore('  Alice  ', 100);

    expect(result).toBe('doc-123');
    expect(collection).toHaveBeenCalledWith(db, 'leaderboard');
    expect(addDoc).toHaveBeenCalledWith('mock-collection', {
      name: 'Alice',
      score: 100,
      createdAt: 'mock-timestamp',
      userId: 'test-user-id'
    });
    expect(localStorage.setItem).toHaveBeenCalledWith('lastSubmitSequence', Date.now().toString());
    expect(localStorage.setItem).toHaveBeenCalledWith('playerName', 'Alice');
  });

  it('handles and rethrows addDoc errors', async () => {
    const error = new Error('Firestore error');
    addDoc.mockRejectedValueOnce(error);

    // Suppress console.error for this test to keep output clean
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(submitScore('Alice', 100)).rejects.toThrow('Firestore error');

    consoleSpy.mockRestore();
  });
});
