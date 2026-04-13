import { motion, AnimatePresence } from 'framer-motion';
import { WinnerPayload } from '../../types';
import { useAuthStore } from '../../store/authStore';

interface Props {
  payload: WinnerPayload | null;
}

export function WinnerBanner({ payload }: Props) {
  const currentUser = useAuthStore((s) => s.user);
  const isMe = currentUser?.username === payload?.winner;

  return (
    <AnimatePresence>
      {payload && (
        <motion.div
          key={payload.questionId}
          initial={{ opacity: 0, scale: 0.8, y: -30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{
            background: isMe
              ? 'linear-gradient(135deg, #16a34a22, #15803d44)'
              : 'linear-gradient(135deg, #1e293b, #0f172a)',
            border: `2px solid ${isMe ? '#22c55e' : '#818cf8'}`,
            borderRadius: 12,
            padding: '20px 24px',
            textAlign: 'center',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 4 }}>{isMe ? '🏆' : '🎉'}</div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: isMe ? '#22c55e' : '#818cf8',
              marginBottom: 4,
            }}
          >
            {isMe ? 'You won!' : `${payload.winner} wins!`}
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>
            {payload.expression} = <strong style={{ color: '#f1f5f9' }}>{payload.answer}</strong>
          </div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            +{payload.pointsAwarded} pts · solved in {(payload.solveTimeMs / 1000).toFixed(1)}s
          </div>
          <div style={{ fontSize: 12, color: '#475569', marginTop: 8 }}>
            Next question in a few seconds...
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
