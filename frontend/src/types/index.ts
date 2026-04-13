export interface Question {
  id: string;
  expression: string;
  difficulty: 'easy' | 'medium' | 'hard';
  startedAt: number;
  questionNumber: number;
}

export interface WinnerPayload {
  questionId: string;
  winner: string;
  solveTimeMs: number;
  pointsAwarded: number;
  expression: string;
  answer: number;
}

export interface LeaderboardEntry {
  username: string;
  score?: number;
  total_wins?: number;
  total_points?: number;
}

export interface SyncPayload {
  question: Question | null;
  timeElapsed: number;
  currentWinner: string | null;
  connectedCount: number;
  leaderboard: LeaderboardEntry[];
}

export interface SubmitResult {
  result: 'correct_first' | 'correct_not_first' | 'incorrect' | 'stale';
  message: string;
  winner?: string;
}

export interface User {
  id: string;
  username: string;
}
