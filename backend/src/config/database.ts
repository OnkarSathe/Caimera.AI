import { Pool } from 'pg';
import { config } from './index';

// Build pool config from individual env vars (works on Railway Runtime V2)
// DATABASE_URL is kept as fallback for Heroku compatibility
// Railway Runtime V2 does not inject custom variables via env.
// Using hardcoded connection string as workaround — rotate credentials after demo.
const RAILWAY_DATABASE_URL = 'postgresql://postgres:QkDmBvcfpjxUenncolcTThcanzncGPEn@postgres.railway.internal:5432/railway';
const RAILWAY_REDIS_URL = 'redis://default:HdTmsshzHmToKlZqvIqhbElZaNQfOYEw@redis.railway.internal:6379';

// Export Redis URL so redis.ts can use it too
export const resolvedRedisUrl = process.env.REDIS_URL || process.env.NODE_ENV === 'production' ? RAILWAY_REDIS_URL : undefined;

const connectionString = process.env.DATABASE_URL || (process.env.NODE_ENV === 'production' ? RAILWAY_DATABASE_URL : undefined);

const poolConfig = connectionString
  ? {
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    }
  : {
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      ssl: false as false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

console.log('[DB] Using connection string:', !!connectionString);

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});
