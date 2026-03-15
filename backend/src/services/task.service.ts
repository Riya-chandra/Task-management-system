// ============================================================
// Task Service — Business logic for Task CRUD
// ============================================================

import prisma from '../prisma/client';
import { CreateTaskDTO, UpdateTaskDTO, TaskQueryParams, PaginatedResponse, AppError } from '../types';
import { Task } from '@prisma/client';

const makeError = (message: string, statusCode: number): AppError => {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  return err;
};

export const TaskService = {
  /** Get paginated, filterable, searchable task list for a user */
  async getTasks(userId: string, params: TaskQueryParams): Promise<PaginatedResponse<Task>> {
    const page = Math.max(1, parseInt(params.page || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(params.limit || '10')));
    const skip = (page - 1) * limit;

    // Build dynamic WHERE clause
    const where: Record<string, unknown> = { userId };
    if (params.status) where['status'] = params.status;
    if (params.search) {
      where['title'] = { contains: params.search };
    }

    // Fetch items and total count in parallel
    const [items, total] = await Promise.all([
      prisma.task.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.task.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  },

  /** Get a single task — enforces ownership */
  async getTaskById(id: string, userId: string): Promise<Task> {
    const task = await prisma.task.findFirst({ where: { id, userId } });
    if (!task) throw makeError('Task not found', 404);
    return task;
  },

  /** Create a new task for the authenticated user */
  async createTask(userId: string, dto: CreateTaskDTO): Promise<Task> {
    return prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status || 'PENDING',
        userId,
      },
    });
  },

  /** Partial update — only provided fields are changed */
  async updateTask(id: string, userId: string, dto: UpdateTaskDTO): Promise<Task> {
    await TaskService.getTaskById(id, userId); // Verify ownership

    return prisma.task.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });
  },

  /** Toggle PENDING ↔ COMPLETED */
  async toggleTask(id: string, userId: string): Promise<Task> {
    const task = await TaskService.getTaskById(id, userId);
    return prisma.task.update({
      where: { id },
      data: { status: task.status === 'PENDING' ? 'COMPLETED' : 'PENDING' },
    });
  },

  /** Permanently delete a task */
  async deleteTask(id: string, userId: string): Promise<void> {
    await TaskService.getTaskById(id, userId); // Verify ownership
    await prisma.task.delete({ where: { id } });
  },
};
