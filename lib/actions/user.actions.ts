'use server';

import { connectToDatabase } from '../mongodb';
import User from '../../models/User';

export interface CreateUserParams {
  clerkId: string;
  email: string;
  username: string;
  photo?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdateUserParams {
  email?: string;
  username?: string;
  photo?: string;
  firstName?: string;
  lastName?: string;
  updatedAt?: Date;
}



export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();
    const newUser = await User.create(user);
    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await connectToDatabase();
    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, { new: true });
    if (!updatedUser) throw new Error('User update failed');
    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase();
    const deletedUser = await User.findOneAndDelete({ clerkId });
    if (!deletedUser) throw new Error('User not found');
    return JSON.parse(JSON.stringify(deletedUser));
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

export async function getUserByClerkId(clerkId: string) {
  try {
    await connectToDatabase();
    const user = await User.findOne({ clerkId });
    if (!user) return null;
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}
