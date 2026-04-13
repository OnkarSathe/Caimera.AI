import { Server } from 'socket.io';
import { QuestionPublic, WinnerPayload } from '../types';

let _io: Server | null = null;

export const BroadcastService = {
  init(io: Server) {
    _io = io;
  },

  broadcastNewQuestion(question: QuestionPublic) {
    if (!_io) return;
    _io.emit('new_question', question);
  },

  broadcastWinner(payload: WinnerPayload) {
    if (!_io) return;
    _io.emit('winner_declared', payload);
  },

  broadcastLeaderboard(leaderboard: unknown[]) {
    if (!_io) return;
    _io.emit('leaderboard_update', { leaderboard });
  },

  broadcastUserCount(count: number) {
    if (!_io) return;
    _io.emit('user_count_update', { count });
  },
};
