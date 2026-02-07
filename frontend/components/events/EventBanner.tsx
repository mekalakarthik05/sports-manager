'use client';

import Image from 'next/image';
import { formatDateRange } from '@/lib/utils';
import type { Event } from '@/types';
import { cn } from '@/lib/utils';

interface EventBannerProps {
  event: Event;
  className?: string;
}

export function EventBanner({ event, className }: EventBannerProps) {
  return (
    <div className={cn('relative rounded-xl overflow-hidden bg-dark-800 border border-dark-600', className)}>
      <div className="relative aspect-[21/9] min-h-[120px] bg-dark-700">
        {event.banner_url ? (
          <Image
            src={event.banner_url}
            alt={event.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-5xl">
            🏆
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h1 className="text-xl font-bold text-white drop-shadow">{event.name}</h1>
          <p className="text-sm text-slate-300 mt-0.5">
            {formatDateRange(event.start_date, event.end_date)}
          </p>
        </div>
      </div>
    </div>
  );
}
