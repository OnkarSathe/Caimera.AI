import { Pool } from 'pg';
import { config } from './index';

// Build pool config from individual env vars (works on Railway Runtime V2)
// DATABASE_URL is kept as fallback for Heroku compatibility
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    }
  : {
      host: process.env.DB_HOST || config.db.host,
      port: parseInt(process.env.DB_PORT || String(config.db.port), 10),
      user: process.env.DB_USER || config.db.user,
      password: process.env.DB_PASSWORD || config.db.password,
      database: process.env.DB_NAME || config.db.database,
      // Use SSL in production (required by Railway PostgreSQL)
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

console.log('[DB] Connecting to:', process.env.DB_HOST || config.db.host, 'SSL:', process.env.NODE_ENV === 'production');

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});
