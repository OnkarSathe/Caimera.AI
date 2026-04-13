import { Server } from 'socket.io';
import { AuthSocket } from '../middleware/socketAuth';
import { RedisService } from '../../services/RedisService';
import { BroadcastService } from '../../services/BroadcastService';

// Debounced user count broadcast
let userCountTimer: ReturnType<typeof setTimeout> | null = null;

async function broadcastUserCount(io: Server) {
  if (userCountTimer) return;
  userCountTimer = setTimeout(async () => {
    userCountTimer = null;
    const count = io.engine.clientsCount;
    await RedisService.setConnectedCount(count);
    BroadcastService.broadcastUserCount(count);
  }, 500);
}

export function registerConnectionHandlers(io: Server, socket: AuthSocket) {
  // Send current game state to the newly connected socket only
  (async () => {
    const question = await RedisService.getCurrentQuestion();
    const winner = await RedisService.getWinner();
    const leaderboard = await RedisService.getTopScores(10);

    socket.emit('sync', {
      question: question
        ? {
            id: question.id,
            expression: question.expression,
            difficulty: question.difficulty,
            startedAt: question.startedAt,
            questionNumber: question.questionNumber,
          }
        : null,
      timeElapsed: question ? Date.now() - question.startedAt : 0,
      currentWinner: winner,
      connectedCount: io.engine.clientsCount,
      leaderboard,
    });
  })();

  // Track connected users
  broadcastUserCount(io);

  socket.on('disconnect', () => {
    broadcastUserCount(io);
  });
}
