import { db, auth } from './config';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';

const LEADERBOARD_COLLECTION = 'leaderboard';
const RATE_LIMIT_MS = 10000; // 10 seconds wait between submissions

export const fetchTopScores = async (topN = 10) => {
  try {
    const q = query(
      collection(db, LEADERBOARD_COLLECTION),
      orderBy('score', 'desc'),
      limit(topN)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc, index) => ({
      id: doc.id,
      rank: index + 1,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching leaderboard: ", error);
    throw error;
  }
};

export const submitScore = async (name, score) => {
  if (!auth.currentUser) {
    throw new Error("User must be authenticated to submit a score.");
  }

  // Rate Limiting Validation utilizing localStorage
  const lastSubmit = localStorage.getItem('lastSubmitSequence');
  if (lastSubmit && (Date.now() - parseInt(lastSubmit)) < RATE_LIMIT_MS) {
    throw new Error("Please wait a moment before submitting another score.");
  }

  if (typeof score !== 'number' || score < 0 || score > 100000) {
    throw new Error("Invalid score.");
  }

  try {
    const docRef = await addDoc(collection(db, LEADERBOARD_COLLECTION), {
      name: name.trim().substring(0, 20),
      score,
      createdAt: serverTimestamp(),
      userId: auth.currentUser.uid
    });

    localStorage.setItem('lastSubmitSequence', Date.now().toString());
    localStorage.setItem('playerName', name.trim().substring(0, 20));

    return docRef.id;
  } catch (error) {
    console.error("Error submitting score: ", error);
    throw error;
  }
};
