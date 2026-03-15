
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_EXPIRY = (process.env.JWT_ACCESS_EXPIRY || '15m') as string;
const REFRESH_EXPIRY = (process.env.JWT_REFRESH_EXPIRY || '7d') as string;


export const generateAccessToken = (payload: JWTPayload): string =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY } as jwt.SignOptions);

export const generateRefreshToken = (payload: JWTPayload): string =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY } as jwt.SignOptions);


export const verifyAccessToken = (token: string): JWTPayload =>
  jwt.verify(token, ACCESS_SECRET) as JWTPayload;

export const verifyRefreshToken = (token: string): JWTPayload =>
  jwt.verify(token, REFRESH_SECRET) as JWTPayload;


export const getExpiryDate = (duration: string): Date => {
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid duration: ${duration}`);
  const [, value, unit] = match;
  return new Date(Date.now() + parseInt(value) * multipliers[unit]);
};
