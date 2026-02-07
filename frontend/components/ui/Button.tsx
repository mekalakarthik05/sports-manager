'use client';

import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
        fullWidth && 'w-full',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2.5 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        variant === 'primary' && 'bg-accent-primary text-white hover:bg-rose-600',
        variant === 'secondary' && 'bg-dark-600 text-slate-200 hover:bg-dark-500 border border-dark-500',
        variant === 'ghost' && 'text-slate-300 hover:bg-dark-600',
        variant === 'danger' && 'bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/50',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}
