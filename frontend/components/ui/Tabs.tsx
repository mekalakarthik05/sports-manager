'use client';

import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  sticky?: boolean;
}

export function Tabs({ tabs, activeId, onChange, className, sticky = true }: TabsProps) {
  return (
    <div
      className={cn(
        'flex gap-1 overflow-x-auto hide-scrollbar tabs-scroll bg-dark-900',
        sticky && 'sticky top-0 z-10 py-2 -mx-4 px-4 border-b border-dark-600',
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap',
            activeId === tab.id
              ? 'bg-accent-primary text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-dark-600'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
