'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { getCategoryLabel } from '@/lib/utils';
import type { Sport } from '@/types';
import { cn } from '@/lib/utils';

interface SportCardProps {
  sport: Sport;
  eventId: string;
  className?: string;
}

export function SportCard({ sport, eventId, className }: SportCardProps) {
  return (
    <Link
      href={`/${eventId}/sport/${sport.id}`}
      className={cn('block card-tap', className)}
    >
      <motion.div
        layout
        className="flex items-center justify-between p-4 rounded-xl bg-dark-800 border border-dark-600 active:scale-[0.99]"
      >
        <div>
          <h3 className="font-medium text-slate-100">{sport.name}</h3>
          <p className="text-sm text-slate-500">{getCategoryLabel(sport.category)}</p>
        </div>
        <span className="text-slate-500">→</span>
      </motion.div>
    </Link>
  );
}
