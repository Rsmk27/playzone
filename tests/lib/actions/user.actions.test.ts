import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateUser } from '../../../lib/actions/user.actions';
import User from '../../../models/User';
import * as mongodb from '../../../lib/mongodb';

vi.mock('../../../lib/mongodb', () => ({
  connectToDatabase: vi.fn(),
}));

vi.mock('../../../models/User', () => {
  return {
    default: {
      findOneAndUpdate: vi.fn(),
    },
  };
});

describe('updateUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw an error when user update fails (findOneAndUpdate returns null)', async () => {
    // Mock the findOneAndUpdate to return null
    (User.findOneAndUpdate as any).mockResolvedValue(null);

    // Suppress console.error during this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(updateUser('test-id', { username: 'New Name' })).rejects.toThrow('User update failed');

    expect(mongodb.connectToDatabase).toHaveBeenCalled();
    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { clerkId: 'test-id' },
      { username: 'New Name' },
      { new: true }
    );
    expect(consoleSpy).toHaveBeenCalledWith('Error updating user:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should successfully update and return a user', async () => {
    const mockUser = {
      _id: 'some-id',
      clerkId: 'test-id',
      username: 'New Name',
    };
    (User.findOneAndUpdate as any).mockResolvedValue(mockUser);

    const result = await updateUser('test-id', { username: 'New Name' });

    expect(result).toEqual(mockUser);
    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { clerkId: 'test-id' },
      { username: 'New Name' },
      { new: true }
    );
  });
});
