'use client';

import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-dark-600', className)}
      {...props}
    />
  );
}

export function EventCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-dark-800 border border-dark-600">
      <Skeleton className="h-32 w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export function MatchCardSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-dark-800 border border-dark-600 space-y-3">
      <Skeleton className="h-3 w-20" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-6 w-12 rounded-full" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}
