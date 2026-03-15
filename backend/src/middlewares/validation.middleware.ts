// ============================================================
// Validation Middleware — express-validator rules
// ============================================================

import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

/** Run after validator chains — return 400 with field errors if invalid */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: e.type === 'field' ? e.path : 'unknown',
      message: e.msg,
    }));
    sendError(res, 'Validation failed', 400, formatted);
    return;
  }
  next();
};

// ─── Auth Validators ──────────────────────────────────────────

export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and a number'),
];

export const loginValidator = [
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// ─── Task Validators ──────────────────────────────────────────

export const createTaskValidator = [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ min: 1, max: 200 }).withMessage('Title must be 1–200 characters'),
  body('description').optional().trim()
    .isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters'),
  body('status').optional()
    .isIn(['PENDING', 'COMPLETED']).withMessage('Status must be PENDING or COMPLETED'),
];

export const updateTaskValidator = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty')
    .isLength({ min: 1, max: 200 }).withMessage('Title must be 1–200 characters'),
  body('description').optional().trim()
    .isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters'),
  body('status').optional()
    .isIn(['PENDING', 'COMPLETED']).withMessage('Status must be PENDING or COMPLETED'),
];

export const taskIdValidator = [
  param('id').notEmpty().withMessage('Task ID is required')
    .isUUID().withMessage('Task ID must be a valid UUID'),
];

export const taskQueryValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1–100'),
  query('status').optional().isIn(['PENDING', 'COMPLETED'])
    .withMessage('Status must be PENDING or COMPLETED'),
  query('search').optional().trim().isLength({ max: 100 })
    .withMessage('Search term must not exceed 100 characters'),
];
