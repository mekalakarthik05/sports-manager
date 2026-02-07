'use client';

import { motion } from 'framer-motion';
import type { EventPointsRow } from '@/types';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

function safeNum(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Renders event points table (Olympics style). Data from API only – no client-side calculation. */
interface EventPointsTableProps {
  rows: EventPointsRow[];
  className?: string;
}

export function EventPointsTable({ rows, className }: EventPointsTableProps) {
  const safeRows = Array.isArray(rows) ? rows : [];
  if (safeRows.length === 0) {
    return (
      <EmptyState
        message="No points data yet. Results appear after matches are completed (from server)."
        className={className}
        icon="🏅"
      />
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-2 px-3 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
        <span>#</span>
        <span>Team</span>
        <span className="text-amber-400">🥇</span>
        <span className="text-slate-400">🥈</span>
        <span className="text-amber-700">🥉</span>
        <span>Pts</span>
      </div>
      {safeRows.map((row, index) => (
        <motion.div
          key={row.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
        >
          <Card padding="sm" className="flex items-center gap-2">
            <span className="w-6 text-sm font-semibold text-slate-400">{index + 1}</span>
            <span className="flex-1 min-w-0 font-medium text-slate-100 truncate">
              {row.team_name ?? '—'}
            </span>
            <span className="w-6 text-center text-amber-400">{safeNum(row.gold)}</span>
            <span className="w-6 text-center text-slate-400">{safeNum(row.silver)}</span>
            <span className="w-6 text-center text-amber-700">{safeNum(row.bronze)}</span>
            <span className="w-8 text-right font-semibold text-slate-100">{safeNum(row.total_points)}</span>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
