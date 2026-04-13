import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { redisPub, redisSub } from './config/redis';
import { config } from './config';
import { socketAuth, AuthSocket } from './socket/middleware/socketAuth';
import { registerConnectionHandlers } from './socket/handlers/onConnect';
import { BroadcastService } from './services/BroadcastService';

export function initSocketIO(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Redis adapter for cross-server broadcasting (multi-instance ready)
  io.adapter(createAdapter(redisPub, redisSub));

  // Auth middleware
  io.use(socketAuth);

  // Connection handler
  io.on('connection', (socket) => {
    registerConnectionHandlers(io, socket as AuthSocket);
  });

  // Register io with BroadcastService so it can emit events
  BroadcastService.init(io);

  console.log('[Socket.io] Initialized with Redis adapter');
  return io;
}
