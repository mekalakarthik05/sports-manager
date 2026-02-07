'use client';

import { motion } from 'framer-motion';
import type { SportPointsRow } from '@/types';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

function safeNum(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Renders sport points table (IPL style). Data from API only – no client-side calculation. */
interface SportPointsTableProps {
  rows: SportPointsRow[];
  className?: string;
}

export function SportPointsTable({ rows, className }: SportPointsTableProps) {
  const safeRows = Array.isArray(rows) ? rows : [];
  if (safeRows.length === 0) {
    return (
      <EmptyState
        message="Points table updates when admin adds results (from server)."
        className={className}
        icon="📊"
      />
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-2 px-3 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
        <span>#</span>
        <span>Team</span>
        <span>P</span>
        <span>W</span>
        <span>L</span>
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
            <span className="w-5 text-center text-slate-400">{safeNum(row.matches_played)}</span>
            <span className="w-5 text-center text-slate-400">{safeNum(row.wins)}</span>
            <span className="w-5 text-center text-slate-400">{safeNum(row.losses)}</span>
            <span className="w-8 text-center font-semibold text-slate-100">{safeNum(row.points)}</span>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
