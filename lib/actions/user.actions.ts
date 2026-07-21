'use server';

import { connectToDatabase } from '../mongodb';
import User from '../../models/User';

export interface CreateUserParams {
  clerkId: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  photo?: string;
}

export interface UpdateUserParams {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  photo?: string;
}

// Fast serialization for Mongoose documents, avoiding JSON stringify/parse overhead
function serializeDoc(doc: any) {
  if (!doc) return doc;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  if (obj._id) obj._id = obj._id.toString();
  if (obj.createdAt) obj.createdAt = obj.createdAt.toISOString ? obj.createdAt.toISOString() : new Date(obj.createdAt).toISOString();
  if (obj.updatedAt) obj.updatedAt = obj.updatedAt.toISOString ? obj.updatedAt.toISOString() : new Date(obj.updatedAt).toISOString();
  return obj;
}

export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();
    const newUser = await User.create(user);
    return serializeDoc(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await connectToDatabase();
    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, { new: true }).lean();
    if (!updatedUser) throw new Error('User update failed');
    return serializeDoc(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase();
    const deletedUser = await User.findOneAndDelete({ clerkId }).lean();
    if (!deletedUser) throw new Error('User not found');
    return serializeDoc(deletedUser);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

export async function getUserByClerkId(clerkId: string) {
  try {
    await connectToDatabase();
    const user = await User.findOne({ clerkId }).lean();
    if (!user) return null;
    return serializeDoc(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}
