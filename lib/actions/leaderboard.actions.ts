'use server';

import { connectToDatabase } from '../mongodb';
import Leaderboard from '../../models/Leaderboard';

// In-memory cache for leaderboard to reduce DB queries
let cachedScores: any = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute

export async function fetchTopScores(topN = 10) {
  try {
    const now = Date.now();
    // Use cached data if valid and fetching default topN
    if (cachedScores && (now - lastCacheTime < CACHE_TTL_MS) && topN === 10) {
      return cachedScores;
    }

    await connectToDatabase();
    const scores = await Leaderboard.find({})
      .sort({ score: -1 })
      .limit(topN)
      .lean();

    const formattedScores = scores.map((doc: any, index: number) => ({
      id: doc._id.toString(),
      rank: index + 1,
      name: doc.name,
      score: doc.score,
      userId: doc.userId,
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt
    }));

    // Only cache the default fetch size (10)
    if (topN === 10) {
      cachedScores = formattedScores;
      lastCacheTime = now;
    }

    return formattedScores;
  } catch (error) {
    console.error('Error fetching top scores:', error);
    throw error;
  }
}

export async function submitScore(name: string, score: number, clerkId: string) {
  if (!clerkId) {
    throw new Error('User must be authenticated to submit a score.');
  }

  if (typeof score !== 'number' || Number.isNaN(score) || score < 0 || score > 100000) {
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

    // Invalidate cache immediately on new score submission
    cachedScores = null;
    lastCacheTime = 0;

    return newScore._id.toString();
  } catch (error) {
    console.error('Error submitting score:', error);
    throw error;
  }
}

export function clearLeaderboardCache() {
  cachedScores = null;
  lastCacheTime = 0;
}
