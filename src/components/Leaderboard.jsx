import React, { useState, useEffect } from 'react';
import { signInGlobally } from '../firebase/config';
import { fetchTopScores, submitScore } from '../firebase/leaderboardService';

const Leaderboard = ({ currentScore = null, onBack }) => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState(localStorage.getItem('playerName') || '');
  const [submitting, setSubmitting] = useState(false);
  const [submittedRank, setSubmittedRank] = useState(null);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        await signInGlobally();
        await loadLeaderboard(mounted);
      } catch (err) {
        if (mounted) {
          setError('Failed to connect to Firebase. Check config settings.');
          setLoading(false);
        }
      }
    };
    init();

    return () => {
      mounted = false;
    };
  }, []);

  const loadLeaderboard = async (mounted = true) => {
    try {
      if (mounted) setLoading(true);
      const topScores = await fetchTopScores(10);
      if (mounted) setScores(topScores);
    } catch (err) {
      if (mounted) setError('Failed to load scores. Did you add the Firestore Rules?');
    } finally {
      if (mounted) setLoading(false);
    }
  };

  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      await submitScore(name, currentScore);

      const updatedScores = await fetchTopScores(10);
      setScores(updatedScores);
      
      const userRankInfo = updatedScores.find(s => s.name === name.trim() && s.score === currentScore);
      setSubmittedRank(userRankInfo ? userRankInfo.rank : '10+');
    } catch (err) {
      setError(err.message || 'Failed to submit score.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="leaderboard-wrapper card" style={{ width: '100%', maxWidth: '500px', margin: '20px auto', zIndex: 10 }}>
      <h2 style={{ textAlign: 'center', margin: '0 0 16px', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        🏆 Global Leaderboard
      </h2>
      
      {currentScore !== null && !submittedRank && (
        <form className="score-form" onSubmit={handleScoreSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <div style={{ textAlign: 'center', fontSize: '18px' }}>
            You scored: <strong style={{ color: 'var(--accent-2)' }}>{currentScore}</strong>
          </div>
          <input
            type="text"
            className="search"
            placeholder="Enter your name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            required
            disabled={submitting}
            style={{ width: '100%', padding: '12px', fontSize: '16px' }}
          />
          <button type="submit" className="btn game-btn" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? 'Submitting Score...' : 'Save Score'}
          </button>
        </form>
      )}

      {submittedRank && (
        <div className="info" style={{ background: 'rgba(74, 222, 128, 0.15)', color: 'var(--success)', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
          Score saved successfully! You ranked #{submittedRank}
        </div>
      )}

      {error && (
        <div className="info error" style={{ background: 'rgba(248, 113, 113, 0.15)', color: 'var(--danger)', border: '1px solid rgba(248, 113, 113, 0.3)' }}>
          {error}
        </div>
      )}

      <div className="leaderboard-list">
        {loading ? (
           <div className="info" style={{ marginTop: '20px' }}>Loading global scores...</div>
        ) : scores.length === 0 ? (
           <div className="info" style={{ marginTop: '20px' }}>Be the first to set a high score!</div>
        ) : (
           <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '16px' }}>
             <thead>
               <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                 <th style={{ padding: '12px 8px', color: 'var(--muted)', fontWeight: 600 }}>Rank</th>
                 <th style={{ padding: '12px 8px', color: 'var(--muted)', fontWeight: 600 }}>Player</th>
                 <th style={{ padding: '12px 8px', textAlign: 'right', color: 'var(--muted)', fontWeight: 600 }}>Score</th>
               </tr>
             </thead>
             <tbody>
               {scores.map((scoreInfo) => (
                 <tr key={scoreInfo.id} style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.1)' }}>
                   <td style={{ padding: '12px 8px', color: 'var(--accent-2)', fontWeight: 'bold' }}>
                    #{scoreInfo.rank}
                   </td>
                   <td style={{ padding: '12px 8px', fontWeight: 500 }}>{scoreInfo.name}</td>
                   <td style={{ padding: '12px 8px', textAlign: 'right', color: 'var(--accent)', fontWeight: 'bold' }}>
                    {scoreInfo.score.toLocaleString()}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        )}
      </div>

      {onBack && (
        <button onClick={onBack} className="btn" style={{ marginTop: '24px', width: '100%', background: 'rgba(30, 27, 75, 0.6)' }}>
          Close Leaderboard
        </button>
      )}
    </div>
  );
};

export default Leaderboard;
