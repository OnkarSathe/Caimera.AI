import Redis from 'ioredis';
import { config } from './index';
import { resolvedRedisUrl } from './database';

function createClient() {
  const redisUrl = process.env.REDIS_URL || resolvedRedisUrl;

  if (redisUrl) {
    return new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
    });
  }

  // Local dev fallback
  return new Redis({
    host: config.redis.host,
    port: config.redis.port,
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
