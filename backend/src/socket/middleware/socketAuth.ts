import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { AuthPayload } from '../../types';

export interface AuthSocket extends Socket {
  user?: AuthPayload;
}

export function socketAuth(socket: AuthSocket, next: (err?: Error) => void) {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.query?.token;

  if (!token) {
    // Allow guest connections (they can watch but not submit)
    next();
    return;
  }

  try {
    const payload = jwt.verify(String(token), config.jwt.secret) as AuthPayload;
    socket.user = payload;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
}
