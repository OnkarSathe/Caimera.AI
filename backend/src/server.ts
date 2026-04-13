import 'dotenv/config';
import http from 'http';
import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { initSocketIO } from './socket';
import { runMigrations } from './db/migrate';
import { startGameLoop } from './game/GameLoop';
import authRouter from './routes/auth';
import gameRouter from './routes/game';
import leaderboardRouter from './routes/leaderboard';
import { errorHandler } from './middleware/errorHandler';

const isProd = config.nodeEnv === 'production';

async function bootstrap() {
  const app = express();

  // Security & parsing
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: isProd ? '*' : config.corsOrigin, credentials: true }));
  app.use(express.json());

  // API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/game', gameRouter);
  app.use('/api/leaderboard', leaderboardRouter);
  app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

  // In production, serve the built React app from frontend/dist
  if (isProd) {
    const frontendDist = path.join(__dirname, '../../frontend/dist');
    app.use(express.static(frontendDist));
    // All non-API routes return index.html (client-side routing)
    app.get('*', (_, res) => {
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  }

  app.use(errorHandler);

  const httpServer = http.createServer(app);
  initSocketIO(httpServer);

  // Run DB migrations
  await runMigrations();

  httpServer.listen(config.port, () => {
    console.log(`[Server] Running on port ${config.port}`);
  });

  // Start the game loop
  await startGameLoop();
}

bootstrap().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
