import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUser, updateUser, deleteUser, getUserByClerkId } from './user.actions';
import { connectToDatabase } from '../mongodb';
import User from '../../models/User';

vi.mock('../mongodb', () => ({
  connectToDatabase: vi.fn(),
}));

vi.mock('../../models/User', () => ({
  default: {
    create: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findOneAndDelete: vi.fn(),
    findOne: vi.fn(),
  },
}));

describe('user.actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUser', () => {
    it('should connect to database and create user', async () => {
      const mockUser = {
        clerkId: 'test_clerk_id',
        email: 'test@example.com',
        username: 'testuser',
      };
      const createdUser = { ...mockUser, _id: '123' };
      (User.create as any).mockResolvedValue(createdUser);

      const result = await createUser(mockUser);

      expect(connectToDatabase).toHaveBeenCalled();
      expect(User.create).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(createdUser);
    });

    it('should throw error if creation fails', async () => {
      const error = new Error('Creation failed');
      (User.create as any).mockRejectedValue(error);

      // Need to suppress console.error for this test to keep output clean
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(createUser({ clerkId: 'test_clerk_id', email: 'test@example.com', username: 'testuser' })).rejects.toThrow('Creation failed');

      consoleSpy.mockRestore();
    });
  });

  describe('updateUser', () => {
    it('should connect to database and update user', async () => {
      const mockUserUpdate = { username: 'Updated Name' };
      const updatedUser = { clerkId: 'clerk123', username: 'Updated Name' };
      (User.findOneAndUpdate as any).mockResolvedValue(updatedUser);

      const result = await updateUser('clerk123', mockUserUpdate);

      expect(connectToDatabase).toHaveBeenCalled();
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { clerkId: 'clerk123' },
        mockUserUpdate,
        { new: true }
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw error if user not found for update', async () => {
      (User.findOneAndUpdate as any).mockResolvedValue(null);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(updateUser('clerk123', {})).rejects.toThrow('User update failed');

      consoleSpy.mockRestore();
    });
  });

  describe('deleteUser', () => {
    it('should connect to database and delete user', async () => {
      const deletedUser = { clerkId: 'clerk123', name: 'Deleted User' };
      (User.findOneAndDelete as any).mockResolvedValue(deletedUser);

      const result = await deleteUser('clerk123');

      expect(connectToDatabase).toHaveBeenCalled();
      expect(User.findOneAndDelete).toHaveBeenCalledWith({ clerkId: 'clerk123' });
      expect(result).toEqual(deletedUser);
    });

    it('should throw error if user not found for delete', async () => {
      (User.findOneAndDelete as any).mockResolvedValue(null);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(deleteUser('clerk123')).rejects.toThrow('User not found');

      consoleSpy.mockRestore();
    });
  });

  describe('getUserByClerkId', () => {
    it('should connect to database and get user', async () => {
      const user = { clerkId: 'clerk123', name: 'Test User' };
      (User.findOne as any).mockResolvedValue(user);

      const result = await getUserByClerkId('clerk123');

      expect(connectToDatabase).toHaveBeenCalled();
      expect(User.findOne).toHaveBeenCalledWith({ clerkId: 'clerk123' });
      expect(result).toEqual(user);
    });

    it('should return null if user not found', async () => {
      (User.findOne as any).mockResolvedValue(null);

      const result = await getUserByClerkId('clerk123');

      expect(connectToDatabase).toHaveBeenCalled();
      expect(User.findOne).toHaveBeenCalledWith({ clerkId: 'clerk123' });
      expect(result).toBeNull();
    });
  });
});
