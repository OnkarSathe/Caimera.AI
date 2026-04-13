import { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import { SubmitResult } from '../types';

export function useSubmitAnswer() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = useAuthStore((s) => s.token);
  const setSubmitFeedback = useGameStore((s) => s.setSubmitFeedback);

  async function submitAnswer(questionId: string, answer: string): Promise<SubmitResult | null> {
    if (!token) return null;
    setIsSubmitting(true);

    try {
      const res = await axios.post<SubmitResult>(
        '/api/game/submit',
        { questionId, answer },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data;
      setSubmitFeedback({ result: data.result, message: data.message });

      // Auto-clear feedback after 3 seconds
      setTimeout(() => setSubmitFeedback(null), 3000);

      return data;
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : 'Submission failed';
      setSubmitFeedback({ result: 'stale', message });
      setTimeout(() => setSubmitFeedback(null), 3000);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { submitAnswer, isSubmitting };
}
