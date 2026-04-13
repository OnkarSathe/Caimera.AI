export interface User {
  id: string;
  username: string;
  password_hash: string;
  created_at: Date;
}

export interface Question {
  id: string;
  expression: string;
  answer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  startedAt: number; // unix ms
}

export interface QuestionPublic {
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
  total_wins: number;
  total_points: number;
  avg_solve_ms: number | null;
}

export interface AuthPayload {
  userId: string;
  username: string;
}

// Redis Lua script result codes
export const LUA_RESULT = {
  WINNER: 1,
  ALREADY_WON: 0,
  STALE_QUESTION: -1,
  WRONG_ANSWER: -2,
  NO_QUESTION: -3,
} as const;
