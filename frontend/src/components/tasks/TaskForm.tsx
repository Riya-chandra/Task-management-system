'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Task, CreateTaskPayload, UpdateTaskPayload, TaskStatus } from '@/types';
import { tasksApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface TaskFormProps {
  task?: Task | null;
  defaultStatus?: TaskStatus;
  onSuccess: () => void;
  onCancel: () => void;
}
export function TaskForm({ task, defaultStatus = 'PENDING', onSuccess, onCancel }: TaskFormProps) {
  const isEdit = !!task;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('PENDING');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Populate form in edit mode
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
    } else {
      setTitle(''); setDescription(''); setStatus('PENDING');
    }
    setErrors({});
  }, [task]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    else if (title.trim().length > 200) errs.title = 'Title must be under 200 characters';
    if (description.length > 2000) errs.description = 'Description must be under 2000 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEdit && task) {
        const payload: UpdateTaskPayload = {
          title: title.trim(),
          description: description.trim() || undefined,
          status,
        };
        await tasksApi.update(task.id, payload);
        toast.success('Task updated!');
      } else {
        const payload: CreateTaskPayload = {
          title: title.trim(),
          description: description.trim() || undefined,
          status,
        };
        await tasksApi.create(payload);
        toast.success('Task created!');
      }
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        error={errors.title}
        autoFocus
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Description <span className="text-slate-400 font-normal">(optional)</span></label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details..."
          rows={3}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 hover:border-slate-300 transition-all"
        />
        {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
        <p className="text-xs text-slate-400 text-right">{description.length}/2000</p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Status</label>
        <div className="flex gap-2">
          {(['PENDING', 'COMPLETED'] as TaskStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                status === s
                  ? s === 'COMPLETED'
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                    : 'bg-amber-100 border-amber-300 text-amber-700'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {s === 'COMPLETED' ? '✅ Completed' : '⏳ Pending'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          {isEdit ? 'Save Changes' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
