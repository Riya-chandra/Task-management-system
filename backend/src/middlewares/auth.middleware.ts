// ============================================================
// Authentication Middleware
// Validates Bearer access token on protected routes
// ============================================================

import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { sendError } from '../utils/response';
import { AuthRequest } from '../types';

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      sendError(res, 'Access token required', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    // Attach decoded user to request for downstream handlers
    req.user = { userId: payload.userId, email: payload.email };
    next();
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.name === 'TokenExpiredError') {
        sendError(res, 'Access token expired', 401);
        return;
      }
      if (err.name === 'JsonWebTokenError') {
        sendError(res, 'Invalid access token', 401);
        return;
      }
    }
    sendError(res, 'Authentication failed', 401);
  }
};
