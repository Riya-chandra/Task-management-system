// ============================================================
// Auth Service — Business logic for authentication
// ============================================================

import bcrypt from 'bcryptjs';
import prisma from '../prisma/client';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getExpiryDate,
} from '../utils/jwt';
import { RegisterDTO, LoginDTO, AppError } from '../types';

const BCRYPT_ROUNDS = 12;
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

/** Create a typed AppError with a status code */
const makeError = (message: string, statusCode: number): AppError => {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  return err;
};

export const AuthService = {
  /** Register a new user, return tokens */
  async register(dto: RegisterDTO) {
    const existing = await prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw makeError('Email already in use', 409);

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: { name: dto.name, email: dto.email, password: hashedPassword },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    const payload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: getExpiryDate(REFRESH_EXPIRY) },
    });

    return { user, accessToken, refreshToken };
  },

  /** Login with email + password, return tokens */
  async login(dto: LoginDTO) {
    const user = await prisma.user.findUnique({ where: { email: dto.email } });
    const passwordMatch = user ? await bcrypt.compare(dto.password, user.password) : false;

    // Use consistent error to prevent user enumeration
    if (!user || !passwordMatch) throw makeError('Invalid email or password', 401);

    const payload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: getExpiryDate(REFRESH_EXPIRY) },
    });

    const { password: _pw, ...safeUser } = user;
    return { user: safeUser, accessToken, refreshToken };
  },

  /**
   * Rotate refresh token — revoke old, issue new pair
   * Implements refresh token rotation for security
   */
  async refresh(token: string) {
    // 1. Verify JWT signature
    const payload = verifyRefreshToken(token);

    // 2. Check DB — must exist, not revoked, not expired
    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw makeError('Invalid or expired refresh token', 401);
    }

    // 3. Revoke old token
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });

    // 4. Issue new pair
    const newPayload = { userId: payload.userId, email: payload.email };
    const accessToken = generateAccessToken(newPayload);
    const refreshToken = generateRefreshToken(newPayload);

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: payload.userId, expiresAt: getExpiryDate(REFRESH_EXPIRY) },
    });

    return { accessToken, refreshToken };
  },

  /** Revoke refresh token on logout */
  async logout(token: string) {
    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (stored && !stored.revoked) {
      await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
    }
  },

  /** Periodic cleanup — remove expired/revoked tokens */
  async cleanupExpiredTokens() {
    const result = await prisma.refreshToken.deleteMany({
      where: { OR: [{ expiresAt: { lt: new Date() } }, { revoked: true }] },
    });
    return result.count;
  },
};
