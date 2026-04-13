import Redis from 'ioredis';
import { config } from './index';

const redisOptions = {
  host: config.redis.host,
  port: config.redis.port,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

// Main client for commands
export const redisClient = new Redis(redisOptions);

// Separate client for Pub/Sub subscriptions (a subscribed client can't run regular commands)
export const redisSub = new Redis(redisOptions);

// Separate client for the Redis adapter (Socket.io cross-server broadcasting)
export const redisPub = new Redis(redisOptions);

redisClient.on('error', (err) => console.error('[Redis] client error:', err));
redisSub.on('error', (err) => console.error('[Redis] sub error:', err));
redisPub.on('error', (err) => console.error('[Redis] pub error:', err));

redisClient.on('connect', () => console.log('[Redis] connected'));
