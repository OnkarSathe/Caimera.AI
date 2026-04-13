import rateLimit from 'express-rate-limit';

export const submitRateLimit = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 8,              // 8 submissions per 10s per IP
  message: { error: 'Too many submissions. Slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'Too many auth attempts. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
