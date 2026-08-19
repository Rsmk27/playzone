import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUser, updateUser, deleteUser } from '../../../lib/actions/user.actions';
import User from '../../../models/User';
import * as mongodb from '../../../lib/mongodb';

vi.mock('../../../lib/mongodb', () => ({
  connectToDatabase: vi.fn(),
}));

vi.mock('../../../models/User', () => {
  return {
    default: {
      create: vi.fn(),
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

  it('should throw an error when user update fails (findOneAndUpdate rejects)', async () => {
    const error = new Error('Database update error');
    (User.findOneAndUpdate as any).mockRejectedValue(error);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(updateUser('test-id', { username: 'New Name' })).rejects.toThrow('Database update error');

    expect(mongodb.connectToDatabase).toHaveBeenCalled();
    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { clerkId: 'test-id' },
      { username: 'New Name' },
      { new: true }
    );
    expect(consoleSpy).toHaveBeenCalledWith('Error updating user:', error);

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

describe('deleteUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw an error when user deletion fails (findOneAndDelete returns null)', async () => {
    (User.findOneAndDelete as any).mockResolvedValue(null);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(deleteUser('test-id')).rejects.toThrow('User not found');

    expect(mongodb.connectToDatabase).toHaveBeenCalled();
    expect(User.findOneAndDelete).toHaveBeenCalledWith({ clerkId: 'test-id' });
    expect(consoleSpy).toHaveBeenCalledWith('Error deleting user:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should throw an error when user deletion fails (findOneAndDelete rejects)', async () => {
    const error = new Error('Database deletion error');
    (User.findOneAndDelete as any).mockRejectedValue(error);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(deleteUser('test-id')).rejects.toThrow('Database deletion error');

    expect(mongodb.connectToDatabase).toHaveBeenCalled();
    expect(User.findOneAndDelete).toHaveBeenCalledWith({ clerkId: 'test-id' });
    expect(consoleSpy).toHaveBeenCalledWith('Error deleting user:', error);

    consoleSpy.mockRestore();
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


describe('createUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw an error when user creation fails (create rejects)', async () => {
    const error = new Error('Database creation error');
    (User.create as any).mockRejectedValue(error);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const newUserParams = { clerkId: 'test-id', email: 'test@test.com', username: 'tester' };
    await expect(createUser(newUserParams)).rejects.toThrow('Database creation error');

    expect(mongodb.connectToDatabase).toHaveBeenCalled();
    expect(User.create).toHaveBeenCalledWith(newUserParams);
    expect(consoleSpy).toHaveBeenCalledWith('Error creating user:', error);

    consoleSpy.mockRestore();
  });

  it('should successfully create and return a user', async () => {
    const mockUser = {
      _id: 'some-id',
      clerkId: 'test-id',
      email: 'test@test.com',
      username: 'tester',
    };
    (User.create as any).mockResolvedValue(mockUser);

    const newUserParams = { clerkId: 'test-id', email: 'test@test.com', username: 'tester' };
    const result = await createUser(newUserParams);

    expect(result).toEqual(mockUser);
    expect(User.create).toHaveBeenCalledWith(newUserParams);
  });
});
