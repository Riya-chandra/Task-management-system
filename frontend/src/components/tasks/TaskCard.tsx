'use client';

import { useState } from 'react';
import { Edit2, Trash2, CheckCircle, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';
import { Task } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggle: (task: Task) => void;
}

export function TaskCard({ task, onEdit, onDelete, onToggle }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isDone = task.status === 'COMPLETED';

  return (
    <article className={clsx(
      'group bg-white rounded-xl border transition-all duration-200 hover:shadow-md',
      isDone ? 'border-slate-100 opacity-80' : 'border-slate-200 hover:border-brand-200'
    )}>
      <div className="flex items-start gap-3 p-4">
        {/* Toggle checkbox */}
        <button
          onClick={() => onToggle(task)}
          className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-brand-600 transition-colors"
          title={isDone ? 'Mark as pending' : 'Mark as complete'}
        >
          {isDone
            ? <CheckCircle className="w-5 h-5 text-emerald-500" />
            : <Circle className="w-5 h-5" />
          }
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <h3 className={clsx(
              'text-sm font-semibold text-slate-800 leading-snug',
              isDone && 'line-through text-slate-400'
            )}>
              {task.title}
            </h3>
            <Badge status={task.status} />
          </div>

          {task.description && (
            <div>
              <p className={clsx(
                'text-xs text-slate-500 mt-1 leading-relaxed',
                !expanded && 'line-clamp-2'
              )}>
                {task.description}
              </p>
              {task.description.length > 120 && (
                <button
                  onClick={() => setExpanded(v => !v)}
                  className="text-xs text-brand-600 mt-0.5 hover:underline flex items-center gap-0.5"
                >
                  {expanded ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> More</>}
                </button>
              )}
            </div>
          )}

          <p className="text-[11px] text-slate-400 mt-2">
            {new Date(task.createdAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            })}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={() => onEdit(task)} className="p-1.5 h-auto">
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(task)} className="p-1.5 h-auto hover:text-red-600 hover:bg-red-50">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </article>
  );
}
