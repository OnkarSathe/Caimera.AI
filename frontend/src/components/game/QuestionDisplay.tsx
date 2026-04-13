import { motion, AnimatePresence } from 'framer-motion';
import { Question } from '../../types';

const difficultyColor: Record<string, string> = {
  easy: '#22c55e',
  medium: '#f59e0b',
  hard: '#ef4444',
};

interface Props {
  question: Question | null;
}

export function QuestionDisplay({ question }: Props) {
  return (
    <AnimatePresence mode="wait">
      {question ? (
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          style={{ textAlign: 'center' }}
        >
          <span
            style={{
              display: 'inline-block',
              padding: '2px 12px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: 'uppercase',
              background: difficultyColor[question.difficulty] + '22',
              color: difficultyColor[question.difficulty],
              marginBottom: 16,
              border: `1px solid ${difficultyColor[question.difficulty]}44`,
            }}
          >
            {question.difficulty} · Q#{question.questionNumber}
          </span>

          <div
            style={{
              fontSize: 'clamp(2rem, 6vw, 3.5rem)',
              fontWeight: 700,
              letterSpacing: -1,
              color: '#f1f5f9',
              fontFamily: 'monospace',
              padding: '24px 0',
            }}
          >
            {question.expression} = ?
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', color: '#64748b', padding: 40 }}
        >
          Waiting for next question...
        </motion.div>
      )}
    </AnimatePresence>
  );
}
