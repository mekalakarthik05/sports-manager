'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { formatDateRange } from '@/lib/utils';
import type { Event } from '@/types';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: Event;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  const sportsCount = event.sports_count ?? 0;

  return (
    <Link href={`/${event.id}`} className={cn('block card-tap', className)}>
      <motion.article
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl overflow-hidden bg-dark-800 border border-dark-600 active:scale-[0.99] transition"
      >
        <div className="relative aspect-[2/1] bg-dark-700">
          {event.banner_url ? (
            <Image
              src={event.banner_url}
              alt={event.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-4xl">
              🏆
            </div>
          )}
        </div>
        <div className="p-4">
          <h2 className="font-semibold text-slate-100 line-clamp-2">{event.name}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {formatDateRange(event.start_date, event.end_date)}
          </p>
          <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
            <span>{sportsCount} sports</span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
