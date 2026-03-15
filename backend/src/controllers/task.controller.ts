// ============================================================
// Task Controller — HTTP handlers for Task CRUD
// ============================================================

import { Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest, CreateTaskDTO, UpdateTaskDTO, TaskQueryParams } from '../types';

export const TaskController = {
  /** GET /tasks?page=1&limit=10&status=PENDING&search=meeting */
  async getTasks(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await TaskService.getTasks(req.user!.userId, req.query as TaskQueryParams);
      sendSuccess(res, 'Tasks retrieved successfully', result);
    } catch (err) { next(err); }
  },

  /** GET /tasks/:id */
  async getTaskById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await TaskService.getTaskById(req.params.id, req.user!.userId);
      sendSuccess(res, 'Task retrieved successfully', { task });
    } catch (err) { next(err); }
  },

  /** POST /tasks */
  async createTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await TaskService.createTask(req.user!.userId, req.body as CreateTaskDTO);
      sendCreated(res, 'Task created successfully', { task });
    } catch (err) { next(err); }
  },

  /** PATCH /tasks/:id */
  async updateTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await TaskService.updateTask(req.params.id, req.user!.userId, req.body as UpdateTaskDTO);
      sendSuccess(res, 'Task updated successfully', { task });
    } catch (err) { next(err); }
  },

  /** PATCH /tasks/:id/toggle */
  async toggleTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await TaskService.toggleTask(req.params.id, req.user!.userId);
      sendSuccess(res, `Task marked as ${task.status.toLowerCase()}`, { task });
    } catch (err) { next(err); }
  },

  /** DELETE /tasks/:id */
  async deleteTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await TaskService.deleteTask(req.params.id, req.user!.userId);
      sendSuccess(res, 'Task deleted successfully');
    } catch (err) { next(err); }
  },
};
