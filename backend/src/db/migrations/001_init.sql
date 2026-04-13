-- Users table
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username    VARCHAR(32) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Questions history (immutable audit log)
CREATE TABLE IF NOT EXISTS questions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expression   TEXT NOT NULL,
  answer       NUMERIC NOT NULL,
  difficulty   VARCHAR(16) NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  solved_at    TIMESTAMPTZ,
  winner_id    UUID REFERENCES users(id),
  solve_time_ms INTEGER
);

-- Score events (append-only ledger)
CREATE TABLE IF NOT EXISTS score_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id),
  question_id UUID NOT NULL REFERENCES questions(id),
  points      INTEGER NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Leaderboard view
CREATE MATERIALIZED VIEW IF NOT EXISTS leaderboard AS
SELECT
  u.id,
  u.username,
  COUNT(se.id)::INT         AS total_wins,
  COALESCE(SUM(se.points), 0)::INT AS total_points,
  AVG(q.solve_time_ms)      AS avg_solve_ms,
  MAX(se.created_at)        AS last_win_at
FROM users u
LEFT JOIN score_events se ON se.user_id = u.id
LEFT JOIN questions q ON q.id = se.question_id
GROUP BY u.id, u.username
ORDER BY total_points DESC;

CREATE UNIQUE INDEX IF NOT EXISTS leaderboard_id_idx ON leaderboard(id);
