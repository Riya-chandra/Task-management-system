'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, ChevronLeft, ChevronRight, LayoutList, Columns } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuthStore } from '@/store/auth';
import { useTasks } from '@/hooks/useTasks';
import { tasksApi } from '@/lib/api';
import { Task, TaskFilters, TaskStatus } from '@/types';

import { Navbar } from '@/components/ui/Navbar';
import { Button } from '@/components/ui/Button';
import { TaskList } from '@/components/tasks/TaskList';

import { KanbanView } from '@/components/tasks/KanbanView';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Modal } from '@/components/ui/Modal';

const STATUS_OPTIONS: { label: string; value: TaskStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: '⏳ Pending', value: 'PENDING' },
  { label: '✅ Completed', value: 'COMPLETED' },
];

type ViewMode = 'list' | 'kanban';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filters, setFilters] = useState<TaskFilters>({ page: 1, limit: 10, status: '', search: '' });
  // Kanban loads all tasks (no pagination)
  const [kanbanFilters, setKanbanFilters] = useState<TaskFilters>({ page: 1, limit: 100, status: '', search: '' });
  const [searchInput, setSearchInput] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('PENDING');
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { tasks, pagination, isLoading, mutate } = useTasks(
    isAuthenticated && viewMode === 'list' ? filters : { page: 1, limit: 1 }
  );
  const { tasks: kanbanTasks, mutate: kanbanMutate } = useTasks(
    isAuthenticated && viewMode === 'kanban' ? kanbanFilters : {}
  );

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
      setKanbanFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const mutateAll = () => { mutate(); kanbanMutate(); };

  const openCreate = () => { setEditingTask(null); setDefaultStatus('PENDING'); setModalOpen(true); };
  const openCreateWithStatus = (status: TaskStatus) => { setEditingTask(null); setDefaultStatus(status); setModalOpen(true); };
  const openEdit = (task: Task) => { setEditingTask(task); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingTask(null); };

  const handleFormSuccess = useCallback(() => { closeModal(); mutateAll(); }, [mutate, kanbanMutate]);

  const handleToggle = async (task: Task) => {
    try {
      await tasksApi.toggle(task.id);
      mutateAll();
      toast.success(`Marked as ${task.status === 'PENDING' ? 'completed ✅' : 'pending ⏳'}`);
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await tasksApi.delete(deleteTarget.id);
      toast.success('Task deleted');
      setDeleteTarget(null);
      mutateAll();
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayTasks = viewMode === 'kanban' ? kanbanTasks : tasks;
  const pendingCount = displayTasks.filter(t => t.status === 'PENDING').length;
  const completedCount = displayTasks.filter(t => t.status === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {pendingCount} pending · {completedCount} completed
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 gap-0.5">
              <button
                onClick={() => setViewMode('list')}
                title="List view"
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                title="Kanban view"
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Columns className="w-4 h-4" />
              </button>
            </div>

            <Button onClick={openCreate} className="gap-1.5 shadow-sm">
              <Plus className="w-4 h-4" />
              New Task
            </Button>
          </div>
        </div>

        {/* View label badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            viewMode === 'kanban'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {viewMode === 'kanban' ? '🗂 Kanban View' : '📋 List View'}
          </span>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 mb-5 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search tasks…"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          {viewMode === 'list' && (
            <div className="flex gap-1 items-center">
              <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
              {STATUS_OPTIONS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setFilters(prev => ({ ...prev, status: value, page: 1 }))}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                    filters.status === value
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {viewMode === 'list' && (
          <>
            <TaskList
              tasks={tasks}
              isLoading={isLoading}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onToggle={handleToggle}
            />
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" disabled={!pagination.hasPrev}
                    onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}>
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </Button>
                  <Button variant="secondary" size="sm" disabled={!pagination.hasNext}
                    onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}>
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ─── Kanban View ───────────────────────────── */}
        {viewMode === 'kanban' && (
          <KanbanView
            tasks={kanbanTasks}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            onToggle={handleToggle}
            onCreateWithStatus={openCreateWithStatus}
          />
        )}
      </main>

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={closeModal} title={editingTask ? 'Edit Task' : 'New Task'}>
        <TaskForm
          task={editingTask}
          defaultStatus={defaultStatus}
          onSuccess={handleFormSuccess}
          onCancel={closeModal}
        />
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Task">
        <p className="text-sm text-slate-600 mb-5">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-slate-800">"{deleteTarget?.title}"</span>?
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)} className="flex-1">Cancel</Button>
          <Button variant="danger" loading={deleteLoading} onClick={handleDeleteConfirm} className="flex-1">Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
