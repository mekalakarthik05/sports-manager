'use client';

import { BottomNav } from './BottomNav';
import { cn } from '@/lib/utils';

interface PageShellProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  title?: string;
  className?: string;
}

export function PageShell({
  children,
  showBottomNav = true,
  title,
  className,
}: PageShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {title && (
        <header className="sticky top-0 z-20 bg-dark-900/95 backdrop-blur border-b border-dark-600 py-3 px-4">
          <h1 className="text-lg font-semibold text-slate-100 truncate">{title}</h1>
        </header>
      )}
      <main className={cn('flex-1 pb-20', showBottomNav && 'pb-24', className)}>
        {children}
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}
