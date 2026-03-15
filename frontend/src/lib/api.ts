import api from './axios';
import { User, PaginatedTasks, Task, TaskFilters, CreateTaskPayload, UpdateTaskPayload } from '@/types';

export const authApi = {
  register: async (data: { name: string; email: string; password: string }) => {
    const res = await api.post<{ success: boolean; data: { user: User; accessToken: string } }>(
      '/auth/register', data
    );
    return res.data.data;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await api.post<{ success: boolean; data: { user: User; accessToken: string } }>(
      '/auth/login', data
    );
    return res.data.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },

  me: async () => {
    const res = await api.get<{ success: boolean; data: { user: User } }>('/auth/me');
    return res.data.data.user;
  },
};

export const tasksApi = {
  getAll: async (filters: Partial<TaskFilters>) => {
    const params = new URLSearchParams();
    if (filters.page)   params.set('page',   String(filters.page));
    if (filters.limit)  params.set('limit',  String(filters.limit));
    if (filters.status) params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);

    const res = await api.get<{ success: boolean; data: PaginatedTasks }>(
      `/tasks?${params.toString()}`
    );
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await api.get<{ success: boolean; data: { task: Task } }>(`/tasks/${id}`);
    return res.data.data.task;
  },

  create: async (payload: CreateTaskPayload) => {
    const res = await api.post<{ success: boolean; data: { task: Task } }>('/tasks', payload);
    return res.data.data.task;
  },

  update: async (id: string, payload: UpdateTaskPayload) => {
    const res = await api.patch<{ success: boolean; data: { task: Task } }>(`/tasks/${id}`, payload);
    return res.data.data.task;
  },

  toggle: async (id: string) => {
    const res = await api.patch<{ success: boolean; data: { task: Task } }>(`/tasks/${id}/toggle`);
    return res.data.data.task;
  },

  delete: async (id: string) => {
    await api.delete(`/tasks/${id}`);
  },
};
