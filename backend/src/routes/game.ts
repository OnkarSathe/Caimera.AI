import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { submitRateLimit } from '../middleware/rateLimiter';
import { RedisService } from '../services/RedisService';
import { handleWin } from '../game/GameLoop';
import { LUA_RESULT } from '../types';

const router = Router();

router.get('/current', async (req: Request, res: Response): Promise<void> => {
  const question = await RedisService.getCurrentQuestion();
  if (!question) {
    res.json({ question: null });
    return;
  }

  const winner = await RedisService.getWinner();
  const connectedCount = await RedisService.getConnectedCount();

  // Never expose the answer!
  const { answer, ...safeQuestion } = question;

  res.json({
    question: safeQuestion,
    timeElapsed: Date.now() - question.startedAt,
    currentWinner: winner,
    connectedCount,
  });
});

router.post('/submit', authenticate, submitRateLimit, async (req: AuthRequest, res: Response): Promise<void> => {
  const { questionId, answer } = req.body;
  const username = req.user!.username;

  if (!questionId || answer === undefined || answer === '') {
    res.status(400).json({ error: 'questionId and answer are required' });
    return;
  }

  const answerStr = String(answer).trim();
  if (!/^-?\d+(\.\d+)?$/.test(answerStr)) {
    res.status(400).json({ error: 'Answer must be a number' });
    return;
  }

  const result = await RedisService.checkAnswer(questionId, answerStr, username);

  switch (result.code) {
    case LUA_RESULT.WINNER: {
      const solvedAtMs = parseInt(result.timestamp!, 10);
      // Fire-and-forget the win handler (handles broadcast, DB, next question)
      handleWin(username, solvedAtMs).catch((err) =>
        console.error('[Game] handleWin error:', err)
      );
      res.json({ result: 'correct_first', message: 'You won this round!' });
      break;
    }

    case LUA_RESULT.ALREADY_WON:
      res.json({
        result: 'correct_not_first',
        message: `Correct, but ${result.winner} got there first!`,
        winner: result.winner,
      });
      break;

    case LUA_RESULT.WRONG_ANSWER:
      res.json({ result: 'incorrect', message: 'Wrong answer, try again!' });
      break;

    case LUA_RESULT.STALE_QUESTION:
      res.json({ result: 'stale', message: 'Question already changed!' });
      break;

    case LUA_RESULT.NO_QUESTION:
      res.json({ result: 'stale', message: 'No active question' });
      break;

    default:
      res.status(500).json({ error: 'Unexpected result' });
  }
});

export default router;
