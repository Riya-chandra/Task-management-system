import clsx from 'clsx';
import { TaskStatus } from '@/types';

interface BadgeProps { status: TaskStatus; }

export function Badge({ status }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold',
      status === 'COMPLETED'
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-amber-100 text-amber-700'
    )}>
      <span className={clsx(
        'w-1.5 h-1.5 rounded-full',
        status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-amber-500'
      )} />
      {status === 'COMPLETED' ? 'Completed' : 'Pending'}
    </span>
  );
}
