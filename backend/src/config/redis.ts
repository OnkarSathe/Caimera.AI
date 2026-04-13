import Redis from 'ioredis';
import { config } from './index';

// Heroku Redis provides REDIS_URL as a full connection string
// Fall back to individual host/port for local dev
function createClient() {
  if (process.env.REDIS_URL) {
    return new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      tls: process.env.REDIS_URL.startsWith('rediss://')
        ? { rejectUnauthorized: false }
        : undefined,
    });
  }
  return new Redis({
    host: config.redis.host,
    port: config.redis.port,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
}

// Main client for commands
export const redisClient = createClient();

// Separate client for Pub/Sub subscriptions (a subscribed client can't run regular commands)
export const redisSub = createClient();

// Separate client for the Redis adapter (Socket.io cross-server broadcasting)
export const redisPub = createClient();

redisClient.on('error', (err) => console.error('[Redis] client error:', err));
redisSub.on('error', (err) => console.error('[Redis] sub error:', err));
redisPub.on('error', (err) => console.error('[Redis] pub error:', err));

redisClient.on('connect', () => console.log('[Redis] connected'));
