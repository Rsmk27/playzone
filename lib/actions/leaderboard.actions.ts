'use server';

import { connectToDatabase } from '../mongodb';
import Leaderboard from '../../models/Leaderboard';

export async function fetchTopScores(topN = 10) {
  try {
    await connectToDatabase();
    const scores = await Leaderboard.find({})
      .sort({ score: -1 })
      .limit(topN)
      .lean();

    return scores.map((doc: any, index: number) => ({
      id: doc._id.toString(),
      rank: index + 1,
      name: doc.name,
      score: doc.score,
      userId: doc.userId,
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt
    }));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
}

export async function submitScore(name: string, score: number, clerkId: string) {
  if (!clerkId) {
    throw new Error('User must be authenticated to submit a score.');
  }

  if (typeof score !== 'number' || score < 0 || score > 100000) {
    throw new Error('Invalid score.');
  }

  try {
    await connectToDatabase();
    const newScore = await Leaderboard.create({
      name: name.trim().substring(0, 20),
      score,
      userId: clerkId,
      createdAt: new Date()
    });
    return newScore._id.toString();
  } catch (error) {
    console.error('Error submitting score:', error);
    throw error;
  }
}
