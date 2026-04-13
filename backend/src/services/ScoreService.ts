import { pool } from '../config/database';
import { LeaderboardEntry } from '../types';

export const ScoreService = {
  async recordQuestion(data: {
    id: string;
    expression: string;
    answer: number;
    difficulty: string;
    winnerId?: string;
    solveTimeMs?: number;
  }): Promise<void> {
    await pool.query(
      `INSERT INTO questions (id, expression, answer, difficulty, generated_at, solved_at, winner_id, solve_time_ms)
       VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7)
       ON CONFLICT (id) DO UPDATE
         SET solved_at = EXCLUDED.solved_at,
             winner_id = EXCLUDED.winner_id,
             solve_time_ms = EXCLUDED.solve_time_ms`,
      [
        data.id,
        data.expression,
        data.answer,
        data.difficulty,
        data.winnerId ? new Date() : null,
        data.winnerId || null,
        data.solveTimeMs || null,
      ]
    );
  },

  async recordWin(data: {
    userId: string;
    questionId: string;
    points: number;
  }): Promise<void> {
    await pool.query(
      `INSERT INTO score_events (user_id, question_id, points) VALUES ($1, $2, $3)`,
      [data.userId, data.questionId, data.points]
    );

    // Refresh the materialized view asynchronously
    pool.query(`REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard`).catch((err) => {
      console.error('[DB] Leaderboard refresh failed:', err.message);
    });
  },

  async getUserIdByUsername(username: string): Promise<string | null> {
    const res = await pool.query(`SELECT id FROM users WHERE username = $1`, [username]);
    return res.rows[0]?.id || null;
  },

  async getLeaderboard(limit = 20, offset = 0): Promise<LeaderboardEntry[]> {
    const res = await pool.query(
      `SELECT username, total_wins, total_points, avg_solve_ms
       FROM leaderboard
       ORDER BY total_points DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return res.rows;
  },

  async getUserRank(username: string): Promise<{ rank: number; entry: LeaderboardEntry } | null> {
    const res = await pool.query(
      `SELECT username, total_wins, total_points, avg_solve_ms,
              RANK() OVER (ORDER BY total_points DESC) AS rank
       FROM leaderboard
       WHERE username = $1`,
      [username]
    );
    if (!res.rows[0]) return null;
    const { rank, ...entry } = res.rows[0];
    return { rank: parseInt(rank, 10), entry };
  },
};
