import dotenv from 'dotenv';
dotenv.config();

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'caimera',
    password: process.env.DB_PASSWORD || 'caimera_secret',
    database: process.env.DB_NAME || 'caimera_db',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  game: {
    questionTimeoutMs: parseInt(process.env.QUESTION_TIMEOUT_MS || '45000', 10),
    nextQuestionDelayMs: parseInt(process.env.NEXT_QUESTION_DELAY_MS || '5000', 10),
  },

  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
