'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const DEBOUNCE_MS = 300;

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  'aria-label'?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className,
  'aria-label': ariaLabel = 'Search',
}: SearchInputProps) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    const id = setTimeout(() => onChange(local), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [local, onChange]);

  return (
    <div className={cn('relative', className)}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden>
        🔍
      </span>
      <input
        type="search"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn(
          'w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl',
          'bg-dark-700 border border-dark-500 text-slate-100 placeholder:text-slate-500',
          'focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary'
        )}
      />
    </div>
  );
}
