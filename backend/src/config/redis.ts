import Redis from 'ioredis';
import { config } from './index';

function createClient() {
  // Full URL takes priority (Heroku, or manually set)
  if (process.env.REDIS_URL) {
    return new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      tls: process.env.REDIS_URL.startsWith('rediss://')
        ? { rejectUnauthorized: false }
        : undefined,
    });
  }

  // Individual params — works on Railway Runtime V2
  return new Redis({
    host: process.env.REDIS_HOST || config.redis.host,
    port: parseInt(process.env.REDIS_PORT || String(config.redis.port), 10),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
}

export const redisClient = createClient();
export const redisSub = createClient();
export const redisPub = createClient();

redisClient.on('error', (err) => console.error('[Redis] client error:', err));
redisSub.on('error', (err) => console.error('[Redis] sub error:', err));
redisPub.on('error', (err) => console.error('[Redis] pub error:', err));
redisClient.on('connect', () => console.log('[Redis] connected'));
