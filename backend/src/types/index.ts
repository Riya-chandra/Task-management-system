// ============================================================
// Shared TypeScript Types & Interfaces
// ============================================================

import { Request } from 'express';

// ─── JWT ──────────────────────────────────────────────────────
export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// ─── Authenticated Request ────────────────────────────────────
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

// ─── Task ─────────────────────────────────────────────────────
export type TaskStatus = 'PENDING' | 'COMPLETED';

export interface CreateTaskDTO {
  title: string;
  description?: string;
  status?: TaskStatus;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

export interface TaskQueryParams {
  page?: string;
  limit?: string;
  status?: TaskStatus;
  search?: string;
}

// ─── Auth ─────────────────────────────────────────────────────
export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

// ─── API Responses ────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: { field: string; message: string }[];
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ─── Custom Error ─────────────────────────────────────────────
export interface AppError extends Error {
  statusCode?: number;
}
