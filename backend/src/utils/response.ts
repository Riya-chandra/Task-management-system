
import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200
): Response<ApiResponse<T>> =>
  res.status(statusCode).json({ success: true, message, data });

export const sendCreated = <T>(res: Response, message: string, data?: T): Response =>
  sendSuccess(res, message, data, 201);

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: { field: string; message: string }[]
): Response =>
  res.status(statusCode).json({ success: false, message, ...(errors && { errors }) });
