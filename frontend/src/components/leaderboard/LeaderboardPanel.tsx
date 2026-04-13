import { motion, AnimatePresence } from 'framer-motion';
import { LeaderboardEntry } from '../../types';
import { useAuthStore } from '../../store/authStore';

interface Props {
  entries: LeaderboardEntry[];
}

const medals = ['🥇', '🥈', '🥉'];

export function LeaderboardPanel({ entries }: Props) {
  const currentUser = useAuthStore((s) => s.user);

  return (
    <div
      style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: 12,
        padding: '16px',
        minWidth: 220,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: '#94a3b8',
          letterSpacing: 1,
          textTransform: 'uppercase',
          marginBottom: 12,
        }}
      >
        Leaderboard
      </div>

      {entries.length === 0 ? (
        <div style={{ color: '#475569', fontSize: 13 }}>No scores yet</div>
      ) : (
        <AnimatePresence>
          {entries.map((entry, i) => {
            const name = entry.username;
            const score = entry.score ?? entry.total_points ?? 0;
            const isMe = currentUser?.username === name;

            return (
              <motion.div
                key={name}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 0',
                  borderBottom: i < entries.length - 1 ? '1px solid #1e293b' : undefined,
                }}
              >
                <span style={{ fontSize: 16, width: 24 }}>
                  {i < 3 ? medals[i] : `${i + 1}.`}
                </span>
                <span
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: isMe ? 700 : 400,
                    color: isMe ? '#818cf8' : '#e2e8f0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {name} {isMe && '(you)'}
                </span>
                <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>
                  {score}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}
    </div>
  );
}
