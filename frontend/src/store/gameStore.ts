import { create } from 'zustand';
import { Question, WinnerPayload, LeaderboardEntry } from '../types';

interface SubmitFeedback {
  result: 'correct_first' | 'correct_not_first' | 'incorrect' | 'stale';
  message: string;
}

interface GameState {
  question: Question | null;
  currentWinner: string | null;
  lastWinnerPayload: WinnerPayload | null;
  leaderboard: LeaderboardEntry[];
  connectedCount: number;
  submitFeedback: SubmitFeedback | null;
  isConnected: boolean;

  setQuestion: (q: Question | null) => void;
  setWinner: (payload: WinnerPayload) => void;
  setLeaderboard: (entries: LeaderboardEntry[]) => void;
  setConnectedCount: (count: number) => void;
  setSubmitFeedback: (fb: SubmitFeedback | null) => void;
  setConnected: (v: boolean) => void;
  syncState: (data: {
    question: Question | null;
    currentWinner: string | null;
    connectedCount: number;
    leaderboard: LeaderboardEntry[];
  }) => void;
}

export const useGameStore = create<GameState>((set) => ({
  question: null,
  currentWinner: null,
  lastWinnerPayload: null,
  leaderboard: [],
  connectedCount: 0,
  submitFeedback: null,
  isConnected: false,

  setQuestion: (q) => set({ question: q, currentWinner: null, lastWinnerPayload: null, submitFeedback: null }),
  setWinner: (payload) => set({ currentWinner: payload.winner, lastWinnerPayload: payload }),
  setLeaderboard: (entries) => set({ leaderboard: entries }),
  setConnectedCount: (count) => set({ connectedCount: count }),
  setSubmitFeedback: (fb) => set({ submitFeedback: fb }),
  setConnected: (v) => set({ isConnected: v }),
  syncState: (data) =>
    set({
      question: data.question,
      currentWinner: data.currentWinner,
      connectedCount: data.connectedCount,
      leaderboard: data.leaderboard,
    }),
}));
