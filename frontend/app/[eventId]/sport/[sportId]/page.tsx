'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { sportsApi, matchesApi, pointsApi } from '@/lib/api';
import { PageShell } from '@/components/layout/PageShell';
import { MatchCard } from '@/components/matches/MatchCard';
import { SportPointsTable } from '@/components/points/SportPointsTable';
import { Tabs } from '@/components/ui/Tabs';
import { Skeleton, MatchCardSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { getCategoryLabel } from '@/lib/utils';
import type { Sport, Match, SportPointsRow } from '@/types';

type TabId = 'matches' | 'points' | 'playoffs';

export default function SportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const sportId = params.sportId as string;
  const [tab, setTab] = useState<TabId>('matches');
  const [sport, setSport] = useState<Sport | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [playoffs, setPlayoffs] = useState<Match[]>([]);
  const [pointsTable, setPointsTable] = useState<SportPointsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    if (!sportId) return;
    setError(null);
    setLoading(true);
    Promise.all([
      sportsApi.get(sportId),
      matchesApi.listBySport(sportId),
      pointsApi.sport(sportId),
      matchesApi.getPlayoffs(sportId),
    ])
      .then(([sportRes, matchesRes, pointsRes, playoffsRes]) => {
        setSport(sportRes.data);
        setMatches(Array.isArray(matchesRes.data) ? matchesRes.data : []);
        setPointsTable(Array.isArray(pointsRes.data) ? pointsRes.data : []);
        setPlayoffs(Array.isArray(playoffsRes.data) ? playoffsRes.data : []);
      })
      .catch((err) => setError(err.message || 'Failed to load sport'))
      .finally(() => setLoading(false));
  }, [sportId]);

  useEffect(() => {
    if (!sportId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      sportsApi.get(sportId),
      matchesApi.listBySport(sportId),
      pointsApi.sport(sportId),
      matchesApi.getPlayoffs(sportId),
    ])
      .then(([sportRes, matchesRes, pointsRes, playoffsRes]) => {
        if (cancelled) return;
        setSport(sportRes.data);
        setMatches(Array.isArray(matchesRes.data) ? matchesRes.data : []);
        setPointsTable(Array.isArray(pointsRes.data) ? pointsRes.data : []);
        setPlayoffs(Array.isArray(playoffsRes.data) ? playoffsRes.data : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load sport');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sportId]);

  if (loading && !sport) {
    return (
      <PageShell title="Sport" showBottomNav>
        <div className="px-4 py-4 space-y-4">
          <Skeleton className="h-12 w-full" />
          <MatchCardSkeleton />
          <MatchCardSkeleton />
        </div>
      </PageShell>
    );
  }

  if (error || !sport) {
    return (
      <PageShell title="Sport" showBottomNav>
        <div className="px-4 py-4">
          <ErrorState
            message={error || 'Sport not found'}
            onRetry={refetch}
            onBack={() => router.back()}
          />
        </div>
      </PageShell>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'matches', label: 'Matches' },
    { id: 'points', label: 'Points Table' },
    { id: 'playoffs', label: 'Playoffs' },
  ];

  const displayMatches = tab === 'playoffs' ? playoffs : matches;

  return (
    <PageShell
      title={`${sport.name} (${getCategoryLabel(sport.category)})`}
      showBottomNav
    >
      <div className="px-4 pb-6">
        <Link href={`/${eventId}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 mt-2 mb-2 block">
          ← Event
        </Link>
        <Tabs tabs={tabs} activeId={tab} onChange={(id) => setTab(id as TabId)} className="mt-2" />
        <div className="mt-4">
          {tab === 'matches' && (
            <ul className="space-y-3">
              {matches.length === 0 ? (
                <li>
                  <EmptyState message="No matches scheduled yet. Data comes from the server." icon="📅" />
                </li>
              ) : (
                matches.map((match) => (
                  <li key={match.id}>
                    <MatchCard match={match} sportId={sportId} eventId={eventId} />
                  </li>
                ))
              )}
            </ul>
          )}
          {tab === 'points' && (
            <SportPointsTable rows={pointsTable} />
          )}
          {tab === 'playoffs' && (
            <ul className="space-y-3">
              {playoffs.length === 0 ? (
                <li>
                  <EmptyState message="No playoff matches yet. Admin can generate from points table." icon="🏅" />
                </li>
              ) : (
                playoffs.map((match) => (
                  <li key={match.id}>
                    <MatchCard match={match} sportId={sportId} eventId={eventId} />
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>
    </PageShell>
  );
}
