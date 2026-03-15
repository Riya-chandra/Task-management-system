// ============================================================
// KanbanView Component — Drag-drop style Kanban board
// ============================================================

'use client';

import { useState } from 'react';
import { GripVertical, Edit2, Trash2, Plus } from 'lucide-react';
import clsx from 'clsx';
import { Task } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface KanbanViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggle: (task: Task) => void;
  onCreateWithStatus: (status: 'PENDING' | 'COMPLETED') => void;
}

interface KanbanCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggle: (task: Task) => void;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}

function KanbanCard({ task, onEdit, onDelete, onToggle, isDragging, onDragStart, onDragEnd }: KanbanCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={clsx(
        'bg-white rounded-xl border p-3.5 cursor-grab active:cursor-grabbing',
        'transition-all duration-150 group',
        isDragging
          ? 'opacity-40 scale-95 border-blue-300 shadow-lg rotate-1'
          : 'border-slate-200 hover:border-blue-200 hover:shadow-md'
      )}
    >
      {/* Drag handle + actions */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <GripVertical className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
          <h4 className={clsx(
            'text-sm font-semibold text-slate-800 leading-snug truncate',
            task.status === 'COMPLETED' && 'line-through text-slate-400'
          )}>
            {task.title}
          </h4>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={() => onEdit(task)}
            className="p-1 rounded hover:bg-slate-100 transition-colors">
            <Edit2 className="w-3 h-3 text-slate-400 hover:text-blue-600" />
          </button>
          <button onClick={() => onDelete(task)}
            className="p-1 rounded hover:bg-red-50 transition-colors">
            <Trash2 className="w-3 h-3 text-slate-400 hover:text-red-500" />
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 ml-5 mb-2">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between ml-5 mt-1">
        <span className="text-[10px] text-slate-400">
          {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        <button
          onClick={() => onToggle(task)}
          className={clsx(
            'text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors',
            task.status === 'COMPLETED'
              ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
              : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
          )}
        >
          {task.status === 'COMPLETED' ? '↩ Reopen' : '✓ Complete'}
        </button>
      </div>
    </div>
  );
}

interface ColumnProps {
  title: string;
  count: number;
  color: string;
  dotColor: string;
  bgColor: string;
  borderColor: string;
  tasks: Task[];
  status: 'PENDING' | 'COMPLETED';
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggle: (task: Task) => void;
  onCreateWithStatus: (status: 'PENDING' | 'COMPLETED') => void;
  draggingId: string | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (status: 'PENDING' | 'COMPLETED') => void;
}

function KanbanColumn({
  title, count, color, dotColor, bgColor, borderColor,
  tasks, status, onEdit, onDelete, onToggle, onCreateWithStatus,
  draggingId, onDragStart, onDragEnd, onDrop
}: ColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={() => { setIsDragOver(false); onDrop(status); }}
      className={clsx(
        'flex flex-col rounded-2xl border-2 transition-all duration-200 min-h-[400px]',
        bgColor,
        isDragOver ? `${borderColor} shadow-lg scale-[1.01]` : 'border-transparent'
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <span className={clsx('w-2.5 h-2.5 rounded-full', dotColor)} />
          <h3 className={clsx('text-sm font-bold', color)}>{title}</h3>
          <span className={clsx(
            'text-xs font-bold px-2 py-0.5 rounded-full',
            status === 'PENDING' ? 'bg-amber-200 text-amber-700' : 'bg-emerald-200 text-emerald-700'
          )}>
            {count}
          </span>
        </div>
        <button
          onClick={() => onCreateWithStatus(status)}
          className={clsx(
            'p-1 rounded-lg transition-colors',
            status === 'PENDING' ? 'hover:bg-amber-200 text-amber-500' : 'hover:bg-emerald-200 text-emerald-500'
          )}
          title={`Add ${title} task`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Drop zone hint */}
      {isDragOver && (
        <div className={clsx(
          'mx-3 mb-2 rounded-xl border-2 border-dashed py-3 text-center text-xs font-medium transition-all',
          status === 'PENDING'
            ? 'border-amber-400 text-amber-500 bg-amber-50'
            : 'border-emerald-400 text-emerald-500 bg-emerald-50'
        )}>
          Drop here to mark as {status === 'PENDING' ? '⏳ Pending' : '✅ Completed'}
        </div>
      )}

      {/* Cards */}
      <div className="flex flex-col gap-2.5 px-3 pb-4 flex-1">
        {tasks.length === 0 && !isDragOver ? (
          <div className="flex flex-col items-center justify-center flex-1 py-10 text-center">
            <div className={clsx(
              'w-12 h-12 rounded-2xl flex items-center justify-center mb-2',
              status === 'PENDING' ? 'bg-amber-100' : 'bg-emerald-100'
            )}>
              <span className="text-2xl">{status === 'PENDING' ? '📋' : '🎉'}</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {status === 'PENDING' ? 'No pending tasks' : 'No completed tasks'}
            </p>
            <button
              onClick={() => onCreateWithStatus(status)}
              className={clsx(
                'mt-2 text-xs font-semibold underline underline-offset-2',
                status === 'PENDING' ? 'text-amber-500' : 'text-emerald-500'
              )}
            >
              + Add one
            </button>
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggle={onToggle}
              isDragging={draggingId === task.id}
              onDragStart={() => onDragStart(task.id)}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function KanbanView({ tasks, onEdit, onDelete, onToggle, onCreateWithStatus }: KanbanViewProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const pending = tasks.filter(t => t.status === 'PENDING');
  const completed = tasks.filter(t => t.status === 'COMPLETED');

  const handleDrop = (targetStatus: 'PENDING' | 'COMPLETED') => {
    if (!draggingId) return;
    const task = tasks.find(t => t.id === draggingId);
    if (task && task.status !== targetStatus) {
      onToggle(task);
    }
    setDraggingId(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
      <KanbanColumn
        title="Pending"
        count={pending.length}
        color="text-amber-700"
        dotColor="bg-amber-500"
        bgColor="bg-amber-50/60"
        borderColor="border-amber-400"
        tasks={pending}
        status="PENDING"
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
        onCreateWithStatus={onCreateWithStatus}
        draggingId={draggingId}
        onDragStart={setDraggingId}
        onDragEnd={() => setDraggingId(null)}
        onDrop={handleDrop}
      />
      <KanbanColumn
        title="Completed"
        count={completed.length}
        color="text-emerald-700"
        dotColor="bg-emerald-500"
        bgColor="bg-emerald-50/60"
        borderColor="border-emerald-400"
        tasks={completed}
        status="COMPLETED"
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
        onCreateWithStatus={onCreateWithStatus}
        draggingId={draggingId}
        onDragStart={setDraggingId}
        onDragEnd={() => setDraggingId(null)}
        onDrop={handleDrop}
      />
    </div>
  );
}
