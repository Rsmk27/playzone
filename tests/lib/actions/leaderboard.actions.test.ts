import { describe, it, expect, vi } from 'vitest';
import { submitScore } from '../../../lib/actions/leaderboard.actions';

// Mock connectToDatabase and Leaderboard model
vi.mock('../../../lib/mongodb', () => ({
  connectToDatabase: vi.fn(),
}));

vi.mock('../../../models/Leaderboard', () => ({
  default: {
    create: vi.fn().mockResolvedValue({ _id: { toString: () => 'mock_id' } }),
  },
}));

describe('submitScore validation', () => {
  it('should throw an error if clerkId is missing', async () => {
    await expect(submitScore('Test User', 100, '')).rejects.toThrow('User must be authenticated to submit a score.');
  });

  it('should throw an error if score is not a number', async () => {
    await expect(submitScore('Test User', '100' as any, 'user_123')).rejects.toThrow('Invalid score.');
  });

  it('should throw an error if score is NaN', async () => {
    await expect(submitScore('Test User', NaN, 'user_123')).rejects.toThrow('Invalid score.');
  });

  it('should throw an error if score is less than 0', async () => {
    await expect(submitScore('Test User', -1, 'user_123')).rejects.toThrow('Invalid score.');
  });

  it('should throw an error if score is greater than 100000', async () => {
    await expect(submitScore('Test User', 100001, 'user_123')).rejects.toThrow('Invalid score.');
  });

  it('should succeed with valid inputs', async () => {
    const result = await submitScore('Test User', 500, 'user_123');
    expect(result).toBe('mock_id');
  });
});
