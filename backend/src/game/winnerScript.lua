-- Redis Lua script for atomic winner detection
-- KEYS[1] = game:winner
-- KEYS[2] = game:current_question
-- ARGV[1] = submitted questionId
-- ARGV[2] = submitted answer (string)
-- ARGV[3] = username
-- ARGV[4] = server timestamp (ms)
--
-- Return codes:
--  {1, username, timestamp} = winner!
--  {0, existing_winner}     = already won by someone else
--  {-1}                     = stale question id (question changed)
--  {-2}                     = wrong answer
--  {-3}                     = no active question

local winner_key = KEYS[1]
local question_key = KEYS[2]
local submitted_qid = ARGV[1]
local submitted_ans = ARGV[2]
local username = ARGV[3]
local server_ts = ARGV[4]

-- Step 1: Already won?
local existing_winner = redis.call('GET', winner_key)
if existing_winner then
  return {0, existing_winner}
end

-- Step 2: Active question?
local q_json = redis.call('GET', question_key)
if not q_json then
  return {-3}
end

local ok, q = pcall(cjson.decode, q_json)
if not ok then
  return {-3}
end

-- Step 3: Question still active?
if q.id ~= submitted_qid then
  return {-1}
end

-- Step 4: Check answer (with small tolerance for float issues)
local submitted_num = tonumber(submitted_ans)
if submitted_num == nil then
  return {-2}
end

local correct_num = tonumber(q.answer)
if math.abs(submitted_num - correct_num) > 0.001 then
  return {-2}
end

-- Step 5: Atomically claim the winner slot
redis.call('SET', winner_key, username)
redis.call('EXPIRE', winner_key, 120)

-- Step 6: Update question with winner info
q.winner = username
q.solvedAt = server_ts
redis.call('SET', question_key, cjson.encode(q))

return {1, username, server_ts}
