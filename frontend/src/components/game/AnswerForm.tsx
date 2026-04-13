import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubmitAnswer } from '../../hooks/useSubmitAnswer';
import { useGameStore } from '../../store/gameStore';
import { useAuthStore } from '../../store/authStore';

interface Props {
  questionId: string | null;
}

const feedbackStyle: Record<string, { border: string; color: string; bg: string }> = {
  correct_first: { border: '#22c55e', color: '#22c55e', bg: '#22c55e11' },
  correct_not_first: { border: '#f59e0b', color: '#f59e0b', bg: '#f59e0b11' },
  incorrect: { border: '#ef4444', color: '#ef4444', bg: '#ef444411' },
  stale: { border: '#64748b', color: '#64748b', bg: '#64748b11' },
};

export function AnswerForm({ questionId }: Props) {
  const [answer, setAnswer] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { submitAnswer, isSubmitting } = useSubmitAnswer();
  const submitFeedback = useGameStore((s) => s.submitFeedback);
  const user = useAuthStore((s) => s.user);

  // Reset input when question changes
  useEffect(() => {
    setAnswer('');
    inputRef.current?.focus();
  }, [questionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionId || !answer.trim() || isSubmitting) return;
    await submitAnswer(questionId, answer.trim());
    setAnswer('');
  };

  const fb = submitFeedback ? feedbackStyle[submitFeedback.result] : null;

  if (!user) {
    return (
      <div style={{ textAlign: 'center', color: '#64748b', padding: '16px 0' }}>
        <a href="/login" style={{ color: '#818cf8' }}>Login</a> to submit answers and compete!
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
        <input
          ref={inputRef}
          type="number"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Your answer..."
          disabled={!questionId || isSubmitting}
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: 18,
            borderRadius: 8,
            border: `2px solid ${fb ? fb.border : '#334155'}`,
            background: fb ? fb.bg : '#1e293b',
            color: '#f1f5f9',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit(e as unknown as React.FormEvent);
          }}
        />
        <button
          type="submit"
          disabled={!questionId || !answer.trim() || isSubmitting}
          style={{
            padding: '12px 24px',
            borderRadius: 8,
            border: 'none',
            background: isSubmitting ? '#334155' : '#818cf8',
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          {isSubmitting ? '...' : 'Submit'}
        </button>
      </form>

      <AnimatePresence>
        {submitFeedback && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginTop: 8,
              padding: '8px 14px',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              color: fb?.color,
              background: fb?.bg,
              border: `1px solid ${fb?.border}`,
            }}
          >
            {submitFeedback.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
