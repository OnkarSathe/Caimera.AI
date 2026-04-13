import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useGameEvents } from '../hooks/useGameEvents';
import { useAuthStore } from '../store/authStore';
import { connectSocket } from '../socket/socketClient';
import { QuestionDisplay } from '../components/game/QuestionDisplay';
import { AnswerForm } from '../components/game/AnswerForm';
import { Timer } from '../components/game/Timer';
import { WinnerBanner } from '../components/game/WinnerBanner';
import { ActiveUsers } from '../components/game/ActiveUsers';
import { LeaderboardPanel } from '../components/leaderboard/LeaderboardPanel';
import { useNavigate } from 'react-router-dom';

export function GamePage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { question, lastWinnerPayload, leaderboard, connectedCount, isConnected } = useGameStore();

  useGameEvents();

  useEffect(() => {
    connectSocket(token || undefined);
  }, [token]);

  const isRoundOver = !!lastWinnerPayload;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#020617',
        color: '#f1f5f9',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid #1e293b',
          position: 'sticky',
          top: 0,
          background: '#020617',
          zIndex: 10,
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -1 }}>
          Math<span style={{ color: '#818cf8' }}>Race</span>
        </div>
        <ActiveUsers count={connectedCount} isConnected={isConnected} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>
                Hi, <strong style={{ color: '#818cf8' }}>{user.username}</strong>
              </span>
              <button
                onClick={() => { clearAuth(); navigate('/login'); }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: '1px solid #334155',
                  background: 'transparent',
                  color: '#94a3b8',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                background: '#818cf8',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Login to Compete
            </button>
          )}
        </div>
      </header>

      {/* Main Layout */}
      <div
        style={{
          display: 'flex',
          gap: 24,
          padding: '32px 24px',
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        {/* Game Area */}
        <div style={{ flex: 1 }}>
          <WinnerBanner payload={lastWinnerPayload} />

          <div
            style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: 16,
              padding: '40px 32px',
              marginBottom: 16,
            }}
          >
            <QuestionDisplay question={isRoundOver ? null : question} />

            {question && !isRoundOver && (
              <div style={{ marginTop: 8 }}>
                <Timer startedAt={question.startedAt} stopped={isRoundOver} />
              </div>
            )}
          </div>

          <AnswerForm questionId={isRoundOver ? null : question?.id ?? null} />
        </div>

        {/* Sidebar */}
        <div style={{ width: 260 }}>
          <LeaderboardPanel entries={leaderboard} />
        </div>
      </div>
    </div>
  );
}
