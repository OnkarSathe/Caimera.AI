import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { RedisService } from '../services/RedisService';
import { ScoreService } from '../services/ScoreService';

const router = Router();

// Real-time leaderboard from Redis sorted set (fast)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const limit = Math.min(parseInt(String(req.query.limit || '10'), 10), 50);
  const scores = await RedisService.getTopScores(limit);
  res.json({ leaderboard: scores });
});

// Full persistent leaderboard from PostgreSQL
router.get('/persistent', async (req: Request, res: Response): Promise<void> => {
  const limit = Math.min(parseInt(String(req.query.limit || '20'), 10), 100);
  const offset = parseInt(String(req.query.offset || '0'), 10);
  const leaderboard = await ScoreService.getLeaderboard(limit, offset);
  res.json({ leaderboard });
});

// Authenticated user's own rank
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const username = req.user!.username;
  const rank = await ScoreService.getUserRank(username);
  if (!rank) {
    res.json({ rank: null, message: 'No wins yet!' });
    return;
  }
  res.json(rank);
});

export default router;
