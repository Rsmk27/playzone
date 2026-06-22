import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitScore } from './leaderboard.actions';
import { connectToDatabase } from '../mongodb';
import Leaderboard from '../../models/Leaderboard';

// Mock dependencies
vi.mock('../mongodb', () => ({
  connectToDatabase: vi.fn(),
}));

vi.mock('../../models/Leaderboard', () => ({
  default: {
    create: vi.fn(),
  },
}));

describe('submitScore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should truncate a name longer than 20 characters', async () => {
    // Arrange
    const longName = 'This is a very long name that exceeds twenty characters';
    const score = 100;
    const clerkId = 'user_123';

    // Mock the return value of create
    (Leaderboard.create as any).mockResolvedValue({ _id: { toString: () => 'new_id_123' } });

    // Act
    const result = await submitScore(longName, score, clerkId);

    // Assert
    expect(result).toBe('new_id_123');
    expect(connectToDatabase).toHaveBeenCalled();
    expect(Leaderboard.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'This is a very long ',
        score,
        userId: clerkId,
      })
    );
  });

  it('should trim the name before truncating', async () => {
    // Arrange
    const nameWithSpaces = '   This is a very long name that needs trimming   ';
    const score = 100;
    const clerkId = 'user_123';

    (Leaderboard.create as any).mockResolvedValue({ _id: { toString: () => 'new_id_123' } });

    // Act
    await submitScore(nameWithSpaces, score, clerkId);

    // Assert
    expect(Leaderboard.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'This is a very long ',
        score,
        userId: clerkId,
      })
    );
  });

  it('should not truncate a name shorter than 20 characters', async () => {
    // Arrange
    const shortName = 'Short Name';
    const score = 100;
    const clerkId = 'user_123';

    (Leaderboard.create as any).mockResolvedValue({ _id: { toString: () => 'new_id_123' } });

    // Act
    await submitScore(shortName, score, clerkId);

    // Assert
    expect(Leaderboard.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Short Name',
        score,
        userId: clerkId,
      })
    );
  });
});
