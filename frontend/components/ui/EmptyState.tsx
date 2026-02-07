'use client';

import { cn } from '@/lib/utils';

interface EmptyStateProps {
  message: string;
  className?: string;
  icon?: string;
}

export function EmptyState({ message, className, icon = '—' }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-dark-800 border border-dark-600 p-8 text-center text-slate-500',
        'min-h-[120px] flex flex-col items-center justify-center',
        className
      )}
      role="status"
      aria-label="No data"
    >
      <span className="text-2xl text-slate-600 mb-2" aria-hidden>
        {icon}
      </span>
      <p className="text-sm leading-relaxed max-w-[280px]">{message}</p>
    </div>
  );
}
