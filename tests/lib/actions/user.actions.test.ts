import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUser, updateUser, deleteUser, getUserByClerkId } from '../../../lib/actions/user.actions';
import { connectToDatabase } from '../../../lib/mongodb';
import User from '../../../models/User';

vi.mock('../../../lib/mongodb', () => ({
  connectToDatabase: vi.fn(),
}));

vi.mock('../../../models/User', () => ({
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
    it('should successfully create a user', async () => {
      const mockUser = {
        clerkId: 'test_clerk_id',
        email: 'test@example.com',
        username: 'testuser',
      };
      const createdUser = { ...mockUser, _id: 'mock_db_id' };

      vi.mocked(User.create).mockResolvedValueOnce(createdUser as any);

      const result = await createUser(mockUser);

      expect(connectToDatabase).toHaveBeenCalledTimes(1);
      expect(User.create).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(createdUser);
    });

    it('should throw an error if creating a user fails', async () => {
      const mockUser = { clerkId: 'test_clerk_id', email: 'test@example.com', username: 'testuser' };
      const error = new Error('Creation error');

      vi.mocked(User.create).mockRejectedValueOnce(error);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(createUser(mockUser)).rejects.toThrow('Creation error');

      expect(connectToDatabase).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('Error creating user:', error);

      consoleSpy.mockRestore();
    });
  });

  describe('updateUser', () => {
    it('should successfully update a user', async () => {
      const clerkId = 'test_clerk_id';
      const updateData = { username: 'newusername' };
      const updatedUser = { clerkId, ...updateData, _id: 'mock_db_id' };

      vi.mocked(User.findOneAndUpdate).mockResolvedValueOnce(updatedUser as any);

      const result = await updateUser(clerkId, updateData);

      expect(connectToDatabase).toHaveBeenCalledTimes(1);
      expect(User.findOneAndUpdate).toHaveBeenCalledWith({ clerkId }, updateData, { new: true });
      expect(result).toEqual(updatedUser);
    });

    it('should throw an error if the user is not found during update (findOneAndUpdate returns null)', async () => {
      const clerkId = 'non_existent_id';
      const updateData = { username: 'newusername' };

      vi.mocked(User.findOneAndUpdate).mockResolvedValueOnce(null as any);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(updateUser(clerkId, updateData)).rejects.toThrow('User update failed');

      expect(connectToDatabase).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('Error updating user:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should throw an error if updating a user fails (findOneAndUpdate rejects)', async () => {
      const clerkId = 'test_clerk_id';
      const updateData = { username: 'newusername' };
      const error = new Error('Database error');

      vi.mocked(User.findOneAndUpdate).mockRejectedValueOnce(error);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(updateUser(clerkId, updateData)).rejects.toThrow('Database error');

      expect(connectToDatabase).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('Error updating user:', error);

      consoleSpy.mockRestore();
    });
  });

  describe('deleteUser', () => {
    it('should successfully delete a user', async () => {
      const clerkId = 'test_clerk_id';
      const deletedUser = { clerkId, name: 'Deleted User', _id: 'mock_db_id' };

      vi.mocked(User.findOneAndDelete).mockResolvedValueOnce(deletedUser as any);

      const result = await deleteUser(clerkId);

      expect(connectToDatabase).toHaveBeenCalledTimes(1);
      expect(User.findOneAndDelete).toHaveBeenCalledWith({ clerkId });
      expect(result).toEqual(deletedUser);
    });

    it('should throw an error if the user is not found during deletion (findOneAndDelete returns null)', async () => {
      const clerkId = 'non_existent_id';

      vi.mocked(User.findOneAndDelete).mockResolvedValueOnce(null as any);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(deleteUser(clerkId)).rejects.toThrow('User not found');

      expect(connectToDatabase).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('Error deleting user:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should throw an error if deleting a user fails (findOneAndDelete rejects)', async () => {
      const clerkId = 'test_clerk_id';
      const error = new Error('Database deletion error');

      vi.mocked(User.findOneAndDelete).mockRejectedValueOnce(error);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(deleteUser(clerkId)).rejects.toThrow('Database deletion error');

      expect(connectToDatabase).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('Error deleting user:', error);

      consoleSpy.mockRestore();
    });
  });

  describe('getUserByClerkId', () => {
    it('should successfully fetch a user by clerkId', async () => {
      const clerkId = 'test_clerk_id';
      const user = { clerkId, username: 'testuser', _id: 'mock_db_id' };

      vi.mocked(User.findOne).mockResolvedValueOnce(user as any);

      const result = await getUserByClerkId(clerkId);

      expect(connectToDatabase).toHaveBeenCalledTimes(1);
      expect(User.findOne).toHaveBeenCalledWith({ clerkId });
      expect(result).toEqual(user);
    });

    it('should return null if the user is not found', async () => {
      const clerkId = 'non_existent_id';

      vi.mocked(User.findOne).mockResolvedValueOnce(null as any);

      const result = await getUserByClerkId(clerkId);

      expect(connectToDatabase).toHaveBeenCalledTimes(1);
      expect(User.findOne).toHaveBeenCalledWith({ clerkId });
      expect(result).toBeNull();
    });

    it('should throw an error if fetching a user fails', async () => {
      const clerkId = 'test_clerk_id';
      const error = new Error('Database fetch error');

      vi.mocked(User.findOne).mockRejectedValueOnce(error);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(getUserByClerkId(clerkId)).rejects.toThrow('Database fetch error');

      expect(connectToDatabase).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching user:', error);

      consoleSpy.mockRestore();
    });
  });
});
