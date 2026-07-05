import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateUser, deleteUser } from '../../../lib/actions/user.actions';
import User from '../../../models/User';
import * as mongodb from '../../../lib/mongodb';

vi.mock('../../../lib/mongodb', () => ({
  connectToDatabase: vi.fn(),
}));

vi.mock('../../../models/User', () => {
  return {
    default: {
      findOneAndUpdate: vi.fn(),
      findOneAndDelete: vi.fn(),
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

    await expect(updateUser('test-id', { username: 'New Name' })).rejects.toThrow('User update failed');

    expect(mongodb.connectToDatabase).toHaveBeenCalled();
    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { clerkId: 'test-id' },
      { username: 'New Name' },
      { new: true }
    );
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

describe('deleteUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw an error when user deletion fails (findOneAndDelete returns null)', async () => {
    (User.findOneAndDelete as any).mockResolvedValue(null);

    await expect(deleteUser('test-id')).rejects.toThrow('User not found');

    expect(mongodb.connectToDatabase).toHaveBeenCalled();
    expect(User.findOneAndDelete).toHaveBeenCalledWith({ clerkId: 'test-id' });
  });

  it('should throw an error when user deletion fails (findOneAndDelete rejects)', async () => {
    const error = new Error('Database deletion error');
    (User.findOneAndDelete as any).mockRejectedValue(error);

    await expect(deleteUser('test-id')).rejects.toThrow('Database deletion error');

    expect(mongodb.connectToDatabase).toHaveBeenCalled();
    expect(User.findOneAndDelete).toHaveBeenCalledWith({ clerkId: 'test-id' });
  });

  it('should successfully delete and return a user', async () => {
    const mockUser = {
      _id: 'some-id',
      clerkId: 'test-id',
      name: 'Deleted User',
    };
    (User.findOneAndDelete as any).mockResolvedValue(mockUser);

    const result = await deleteUser('test-id');

    expect(result).toEqual(mockUser);
    expect(User.findOneAndDelete).toHaveBeenCalledWith({ clerkId: 'test-id' });
  });
});
