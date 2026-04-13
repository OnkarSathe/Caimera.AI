import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { config } from '../config';
import { authRateLimit } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authRateLimit, async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }

  const trimmed = username.trim();
  if (trimmed.length < 2 || trimmed.length > 32) {
    res.status(400).json({ error: 'Username must be 2–32 characters' });
    return;
  }
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    res.status(400).json({ error: 'Username may only contain letters, numbers, underscores' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username`,
      [trimmed, hash]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    );

    res.status(201).json({ token, user: { id: user.id, username: user.username } });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === '23505') {
      res.status(409).json({ error: 'Username already taken' });
      return;
    }
    throw err;
  }
});

router.post('/login', authRateLimit, async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }

  const result = await pool.query(
    `SELECT id, username, password_hash FROM users WHERE username = $1`,
    [username.trim()]
  );

  const user = result.rows[0];
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign(
    { userId: user.id, username: user.username },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
  );

  res.json({ token, user: { id: user.id, username: user.username } });
});

export default router;
