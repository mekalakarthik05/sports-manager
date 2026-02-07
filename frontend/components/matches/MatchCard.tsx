'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { formatDateTime, getMatchTypeLabel } from '@/lib/utils';
import type { Match } from '@/types';
import { cn } from '@/lib/utils';

interface MatchCardProps {
  match: Match;
  sportId: string;
  eventId: string;
  className?: string;
}

export function MatchCard({ match, sportId, eventId, className }: MatchCardProps) {
  const isLive = match.status === 'live';
  const isCompleted = match.status === 'completed';

  const team1Name = match.team1_name ?? 'TBD';
  const team2Name = match.team2_name ?? 'TBD';

  let winner: 'team1' | 'team2' | 'draw' | null = null;
  if (isCompleted) {
    if (match.winner_team_id) {
      if (match.winner_team_id === match.team1_id) winner = 'team1';
      else if (match.winner_team_id === match.team2_id) winner = 'team2';
    } else if (
      match.team1_score != null &&
      match.team2_score != null
    ) {
      const s1 = Number(match.team1_score);
      const s2 = Number(match.team2_score);
      if (!Number.isNaN(s1) && !Number.isNaN(s2)) {
        if (s1 > s2) winner = 'team1';
        else if (s2 > s1) winner = 'team2';
        else winner = 'draw';
      }
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'rounded-xl bg-dark-800 border border-dark-600 overflow-hidden',
        className
      )}
    >
      {(match.match_type !== 'group' || isLive) && (
        <div className="px-4 py-1.5 bg-dark-700 border-b border-dark-600 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            {getMatchTypeLabel(match.match_type)}
          </span>
          {match.scheduled_at && (
            <span className="text-slate-500">
              {formatDateTime(match.scheduled_at)}
            </span>
          )}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          {/* TEAM 1 */}
          <div className="flex-1 min-w-0 text-center">
            <p
              className={cn(
                'font-medium truncate',
                winner === 'team1'
                  ? 'text-green-400'
                  : winner === 'team2'
                  ? 'text-slate-500'
                  : 'text-slate-100'
              )}
            >
              {team1Name}
            </p>
            {match.team1_logo && (
              <div className="relative w-12 h-12 mx-auto mt-1">
                <Image
                  src={match.team1_logo}
                  alt={team1Name}
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>

          {/* CENTER */}
          <div className="flex-shrink-0 flex flex-col items-center gap-1">
            {isLive && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-live px-2 py-0.5 text-xs font-medium text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </span>
            )}

            {isCompleted &&
            match.team1_score != null &&
            match.team2_score != null ? (
              <>
                <span className="text-lg font-semibold text-slate-200">
                  {match.team1_score} – {match.team2_score}
                </span>

                {/* ✅ Winner text */}
                {winner === 'draw' ? (
                  <span className="text-xs text-yellow-400 font-medium">
                    Match Drawn
                  </span>
                ) : (
                  <span className="text-xs text-green-400 font-semibold">
                    🏆{' '}
                    {winner === 'team1' ? team1Name : team2Name} won the match
                  </span>
                )}
              </>
            ) : (
              <span className="text-slate-500 text-sm">VS</span>
            )}

            {match.live_stream_url && (
              <a
                href={match.live_stream_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-accent-primary"
              >
                Watch
              </a>
            )}
          </div>

          {/* TEAM 2 */}
          <div className="flex-1 min-w-0 text-center">
            <p
              className={cn(
                'font-medium truncate',
                winner === 'team2'
                  ? 'text-green-400'
                  : winner === 'team1'
                  ? 'text-slate-500'
                  : 'text-slate-100'
              )}
            >
              {team2Name}
            </p>
            {match.team2_logo && (
              <div className="relative w-12 h-12 mx-auto mt-1">
                <Image
                  src={match.team2_logo}
                  alt={team2Name}
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
