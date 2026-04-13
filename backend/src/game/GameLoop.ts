import { generateQuestion } from './QuestionGenerator';
import { RedisService } from '../services/RedisService';
import { BroadcastService } from '../services/BroadcastService';
import { ScoreService } from '../services/ScoreService';
import { config } from '../config';
import { Question } from '../types';

let currentQuestion: Question | null = null;
let questionTimer: ReturnType<typeof setTimeout> | null = null;
let isRunning = false;

function calcPoints(difficulty: string, solveTimeMs: number): number {
  const base = difficulty === 'hard' ? 300 : difficulty === 'medium' ? 200 : 100;
  // Bonus for speed: full base points if solved in under 5s, halved at 20s
  const speedMultiplier = Math.max(0.5, 1 - solveTimeMs / 40000);
  return Math.round(base * speedMultiplier);
}

async function startNextQuestion() {
  const question = generateQuestion();
  currentQuestion = question;

  await RedisService.setCurrentQuestion(question);

  const qNum = await RedisService.getQuestionNumber();

  // Persist question to DB (no winner yet)
  ScoreService.recordQuestion({
    id: question.id,
    expression: question.expression,
    answer: question.answer,
    difficulty: question.difficulty,
  }).catch((err) => console.error('[DB] recordQuestion failed:', err.message));

  BroadcastService.broadcastNewQuestion({
    id: question.id,
    expression: question.expression,
    difficulty: question.difficulty,
    startedAt: question.startedAt,
    questionNumber: qNum,
  });

  console.log(`[Game] Q#${qNum} [${question.difficulty}]: ${question.expression} = ${question.answer}`);

  // Auto-advance after timeout (no one won)
  questionTimer = setTimeout(async () => {
    console.log(`[Game] Q#${qNum} timed out, no winner`);
    await scheduleNextQuestion();
  }, config.game.questionTimeoutMs);
}

async function scheduleNextQuestion() {
  if (questionTimer) {
    clearTimeout(questionTimer);
    questionTimer = null;
  }
  await new Promise((resolve) => setTimeout(resolve, config.game.nextQuestionDelayMs));
  await startNextQuestion();
}

export async function handleWin(winner: string, solvedAtMs: number) {
  if (!currentQuestion) return;

  if (questionTimer) {
    clearTimeout(questionTimer);
    questionTimer = null;
  }

  const solveTimeMs = solvedAtMs - currentQuestion.startedAt;
  const points = calcPoints(currentQuestion.difficulty, solveTimeMs);

  // Broadcast winner to all clients
  BroadcastService.broadcastWinner({
    questionId: currentQuestion.id,
    winner,
    solveTimeMs,
    pointsAwarded: points,
    expression: currentQuestion.expression,
    answer: currentQuestion.answer,
  });

  // Update Redis leaderboard score
  await RedisService.incrementScore(winner, points);

  // Push updated leaderboard
  const leaderboard = await RedisService.getTopScores(10);
  BroadcastService.broadcastLeaderboard(leaderboard);

  // Persist to PostgreSQL (async, non-blocking)
  const winnerId = await ScoreService.getUserIdByUsername(winner);
  if (winnerId) {
    ScoreService.recordWin({
      userId: winnerId,
      questionId: currentQuestion.id,
      points,
    }).catch((err) => console.error('[DB] recordWin failed:', err.message));

    ScoreService.recordQuestion({
      id: currentQuestion.id,
      expression: currentQuestion.expression,
      answer: currentQuestion.answer,
      difficulty: currentQuestion.difficulty,
      winnerId,
      solveTimeMs,
    }).catch((err) => console.error('[DB] recordQuestion update failed:', err.message));
  }

  // Schedule next question
  await scheduleNextQuestion();
}

export async function startGameLoop() {
  if (isRunning) return;
  isRunning = true;
  console.log('[Game] Game loop starting...');
  await startNextQuestion();
}

export function getCurrentQuestion() {
  return currentQuestion;
}
