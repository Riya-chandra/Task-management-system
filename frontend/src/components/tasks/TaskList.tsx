'use client';

import { ClipboardList, Loader2 } from 'lucide-react';
import { Task } from '@/types';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggle: (task: Task) => void;
}

export function TaskList({ tasks, isLoading, onEdit, onDelete, onToggle }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-brand-400" />
        <p className="text-sm">Loading tasks…</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <ClipboardList className="w-12 h-12 mb-3 text-slate-200" />
        <p className="text-base font-medium text-slate-500">No tasks found</p>
        <p className="text-sm mt-1">Create your first task to get started!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 animate-fade-in">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
