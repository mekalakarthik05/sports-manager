'use client';

import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'Loading…', className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-8',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <span
        className="inline-block h-8 w-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"
        aria-hidden
      />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}
