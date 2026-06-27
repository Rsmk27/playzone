import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateUser, createUser } from '../../../lib/actions/user.actions';
import User from '../../../models/User';
import * as mongodb from '../../../lib/mongodb';

vi.mock('../../../lib/mongodb', () => ({
  connectToDatabase: vi.fn(),
}));

vi.mock('../../../models/User', () => {
  return {
    default: {
      findOneAndUpdate: vi.fn(),
      create: vi.fn(),
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

    await expect(updateUser('test-id', { name: 'New Name' })).rejects.toThrow('User update failed');

    expect(mongodb.connectToDatabase).toHaveBeenCalled();
    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { clerkId: 'test-id' },
      { name: 'New Name' },
      { new: true }
    );
    expect(consoleSpy).toHaveBeenCalledWith('Error updating user:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should successfully update and return a user', async () => {
    const mockUser = {
      _id: 'some-id',
      clerkId: 'test-id',
      name: 'New Name',
    };
    (User.findOneAndUpdate as any).mockResolvedValue(mockUser);

    const result = await updateUser('test-id', { name: 'New Name' });

    expect(result).toEqual(mockUser);
    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { clerkId: 'test-id' },
      { name: 'New Name' },
      { new: true }
    );
  });
});


describe('createUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully create and return a user', async () => {
    const mockUser = {
      _id: 'new-id',
      clerkId: 'new-clerk-id',
      name: 'New User',
    };
    (User.create as any).mockResolvedValue(mockUser);

    const result = await createUser(mockUser);

    expect(result).toEqual(mockUser);
    expect(mongodb.connectToDatabase).toHaveBeenCalled();
    expect(User.create).toHaveBeenCalledWith(mockUser);
  });

  it('should throw an error and log it when user creation fails', async () => {
    const error = new Error('User creation failed');
    (User.create as any).mockRejectedValue(error);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(createUser({ name: 'Failed User' })).rejects.toThrow('User creation failed');

    expect(mongodb.connectToDatabase).toHaveBeenCalled();
    expect(User.create).toHaveBeenCalledWith({ name: 'Failed User' });
    expect(consoleSpy).toHaveBeenCalledWith('Error creating user:', error);

    consoleSpy.mockRestore();
  });
});
