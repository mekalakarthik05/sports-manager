'use client';

import { cn } from '@/lib/utils';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
  className?: string;
}

export function ErrorState({ message, onRetry, onBack, className }: ErrorStateProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-red-900/20 border border-red-500/50 p-6 text-center',
        'min-h-[140px] flex flex-col items-center justify-center gap-4',
        className
      )}
      role="alert"
    >
      <p className="text-sm text-red-400 leading-relaxed max-w-[280px]">{message}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="min-h-[44px] min-w-[44px] px-5 py-2.5 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium border border-red-500/50 active:scale-[0.98]"
          >
            Try again
          </button>
        )}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="min-h-[44px] min-w-[44px] px-5 py-2.5 rounded-lg bg-dark-600 text-slate-300 text-sm font-medium border border-dark-500 active:scale-[0.98]"
          >
            Go back
          </button>
        )}
      </div>
    </div>
  );
}
