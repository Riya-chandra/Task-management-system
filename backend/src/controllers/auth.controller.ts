// ============================================================
// Auth Controller — HTTP handlers for authentication
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendCreated, sendError } from '../utils/response';
import { RegisterDTO, LoginDTO, AuthRequest } from '../types';
import prisma from '../prisma/client';

const COOKIE_OPTIONS = {
  httpOnly: true,                                          // JS cannot access
  secure: process.env.COOKIE_SECURE === 'true',           // HTTPS only in prod
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,                       // 7 days
  path: '/',
};

export const AuthController = {
  /** POST /auth/register */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: RegisterDTO = req.body;
      const { user, accessToken, refreshToken } = await AuthService.register(dto);
      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
      sendCreated(res, 'Account created successfully', { user, accessToken });
    } catch (err) { next(err); }
  },

  /** POST /auth/login */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: LoginDTO = req.body;
      const { user, accessToken, refreshToken } = await AuthService.login(dto);
      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
      sendSuccess(res, 'Login successful', { user, accessToken });
    } catch (err) { next(err); }
  },

  /** POST /auth/refresh — reads token from httpOnly cookie */
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token: string | undefined = req.cookies?.refreshToken;
      if (!token) { sendError(res, 'Refresh token not found', 401); return; }

      const { accessToken, refreshToken } = await AuthService.refresh(token);
      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS); // Rotate cookie
      sendSuccess(res, 'Token refreshed', { accessToken });
    } catch (err) { next(err); }
  },

  /** POST /auth/logout */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token: string | undefined = req.cookies?.refreshToken;
      if (token) await AuthService.logout(token);
      res.clearCookie('refreshToken', { path: '/' });
      sendSuccess(res, 'Logged out successfully');
    } catch (err) { next(err); }
  },

  /** GET /auth/me — current user profile */
  async me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { id: true, name: true, email: true, createdAt: true },
      });
      if (!user) { sendError(res, 'User not found', 404); return; }
      sendSuccess(res, 'Profile retrieved', { user });
    } catch (err) { next(err); }
  },
};
