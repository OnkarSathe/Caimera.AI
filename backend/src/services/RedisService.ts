import fs from 'fs';
import path from 'path';
import { redisClient } from '../config/redis';
import { Question, LUA_RESULT } from '../types';

const WINNER_KEY = 'game:winner';
const QUESTION_KEY = 'game:current_question';
const SCORES_KEY = 'game:scores';
const QUESTION_NUMBER_KEY = 'game:question_number';

let winnerScriptSha: string | null = null;

// Load and cache the Lua script SHA on first use
async function getWinnerScriptSha(): Promise<string> {
  if (winnerScriptSha) return winnerScriptSha;

  const scriptPath = path.join(__dirname, '../game/winnerScript.lua');
  const script = fs.readFileSync(scriptPath, 'utf8');
  winnerScriptSha = await redisClient.script('LOAD', script) as string;
  console.log('[Redis] Lua winner script loaded, SHA:', winnerScriptSha);
  return winnerScriptSha;
}

export const RedisService = {
  async setCurrentQuestion(question: Question): Promise<void> {
    const num = await redisClient.incr(QUESTION_NUMBER_KEY);
    const payload = { ...question, questionNumber: num };
    await redisClient.del(WINNER_KEY);
    await redisClient.set(QUESTION_KEY, JSON.stringify(payload));
  },

  async getCurrentQuestion(): Promise<(Question & { questionNumber: number }) | null> {
    const raw = await redisClient.get(QUESTION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  },

  async checkAnswer(
    questionId: string,
    answer: string,
    username: string
  ): Promise<{ code: number; winner?: string; timestamp?: string }> {
    const sha = await getWinnerScriptSha();
    const serverTs = Date.now().toString();

    const result = await redisClient.evalsha(
      sha,
      2,
      WINNER_KEY,
      QUESTION_KEY,
      questionId,
      answer,
      username,
      serverTs
    ) as number[];

    const code = result[0];
    return {
      code,
      winner: result[1] ? String(result[1]) : undefined,
      timestamp: result[2] ? String(result[2]) : undefined,
    };
  },

  async getWinner(): Promise<string | null> {
    return redisClient.get(WINNER_KEY);
  },

  async incrementScore(username: string, points: number): Promise<void> {
    await redisClient.zincrby(SCORES_KEY, points, username);
  },

  async getTopScores(limit = 10): Promise<Array<{ username: string; score: number }>> {
    const results = await redisClient.zrevrange(SCORES_KEY, 0, limit - 1, 'WITHSCORES');
    const entries: Array<{ username: string; score: number }> = [];
    for (let i = 0; i < results.length; i += 2) {
      entries.push({ username: results[i], score: parseFloat(results[i + 1]) });
    }
    return entries;
  },

  async getQuestionNumber(): Promise<number> {
    const n = await redisClient.get(QUESTION_NUMBER_KEY);
    return n ? parseInt(n, 10) : 0;
  },

  async getConnectedCount(): Promise<number> {
    const val = await redisClient.get('game:connected_count');
    return val ? parseInt(val, 10) : 0;
  },

  async setConnectedCount(count: number): Promise<void> {
    await redisClient.set('game:connected_count', count.toString());
  },
};
