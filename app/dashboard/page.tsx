import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const email = user.emailAddresses[0]?.emailAddress || 'No email provided';
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous User';
  const username = user.username || `${user.firstName || 'user'}`.toLowerCase();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--body-bg)',
      padding: '24px',
      color: '#fff'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '500px',
        padding: '32px',
        textAlign: 'center',
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(14px)',
        border: '1px solid rgba(139, 92, 246, 0.22)',
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
      }}>
        <h2 style={{
          margin: '0 0 24px 0',
          fontSize: '28px',
          fontWeight: 800,
          background: 'var(--accent-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🎮 Player Profile
        </h2>

        {user.imageUrl && (
          <img
            src={user.imageUrl}
            alt={fullName}
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              border: '3px solid var(--accent)',
              marginBottom: '20px',
              boxShadow: '0 0 16px rgba(139, 92, 246, 0.4)'
            }}
          />
        )}

        <div style={{ marginBottom: '24px', textAlign: 'left', background: 'rgba(255, 255, 255, 0.03)', padding: '16px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>Player Name</span>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9' }}>{fullName}</div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>Username</span>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--accent-2)' }}>@{username}</div>
          </div>
          <div>
            <span style={{ color: 'var(--muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</span>
            <div style={{ fontSize: '16px', fontWeight: 500, color: '#e2e8f0' }}>{email}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link href="/" className="btn" style={{
            flex: 1,
            padding: '12px 24px',
            borderRadius: '12px',
            textDecoration: 'none',
            fontSize: '15px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            color: '#fff',
            boxShadow: '0 6px 18px rgba(139, 92, 246, 0.4)'
          }}>
            🕹️ Back to Arcade
          </Link>
        </div>
      </div>
    </div>
  );
}
