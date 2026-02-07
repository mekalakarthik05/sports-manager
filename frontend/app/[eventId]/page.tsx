'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { eventsApi } from '@/lib/api';
import { PageShell } from '@/components/layout/PageShell';
import { EventBanner } from '@/components/events/EventBanner';
import { SportCard } from '@/components/sports/SportCard';
import { EventPointsTable } from '@/components/points/EventPointsTable';
import { Tabs } from '@/components/ui/Tabs';
import { SearchInput } from '@/components/ui/SearchInput';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import type { Event, Sport, EventPointsRow } from '@/types';

type TabId = 'overview' | 'sports' | 'points';

export default function EventDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const [tab, setTab] = useState<TabId>('overview');
  const [sportSearch, setSportSearch] = useState('');
  const [data, setData] = useState<(Event & {
    sports: Sport[];
    points_table: EventPointsRow[];
  }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;
    setLoading(true);
    eventsApi
      .dashboard(eventId)
      .then((res) => {
        if (!cancelled) setData(res.data as typeof data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load event');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const refetch = useCallback(() => {
    if (!eventId) return;
    setError(null);
    setLoading(true);
    eventsApi
      .dashboard(eventId)
      .then((res) => setData(res.data as typeof data))
      .catch((err) => setError(err.message || 'Failed to load event'))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading && !data) {
    return (
      <PageShell title="Event" showBottomNav>
        <div className="px-4 py-4 space-y-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </PageShell>
    );
  }

  if (error || !data) {
    return (
      <PageShell title="Event" showBottomNav>
        <div className="px-4 py-4">
          <ErrorState
            message={error || 'Event not found'}
            onRetry={refetch}
            onBack={() => router.back()}
          />
        </div>
      </PageShell>
    );
  }

  const event: Event = {
    id: data.id,
    name: data.name,
    banner_url: data.banner_url,
    start_date: data.start_date,
    end_date: data.end_date,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
  const allSports = Array.isArray(data.sports) ? data.sports : [];
  const sports = sportSearch.trim()
    ? allSports.filter((s) => (s.name ?? '').toLowerCase().includes(sportSearch.trim().toLowerCase()))
    : allSports;
  const points_table = Array.isArray(data.points_table) ? data.points_table : [];

  const tabs = [
    { id: 'overview' as TabId, label: 'Overview' },
    { id: 'sports' as TabId, label: 'Sports' },
    { id: 'points' as TabId, label: 'Points Table' },
  ];

  return (
    <PageShell showBottomNav>
      <div className="px-4 pb-6">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 mt-2 mb-2">
          ← Events
        </Link>
        <EventBanner event={event} className="mt-4" />
        <Tabs tabs={tabs} activeId={tab} onChange={(id) => setTab(id as TabId)} className="mt-4" />
        <div className="mt-4">
          {tab === 'overview' && (
            <div className="space-y-4">
              <p className="text-slate-400 text-sm">
                {sports.length} sport{sports.length !== 1 ? 's' : ''} in this event.
              </p>
              <div className="grid gap-2">
                {sports.slice(0, 5).map((sport) => (
                  <SportCard key={sport.id} sport={sport} eventId={eventId} />
                ))}
                {sports.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setTab('sports')}
                    className="text-accent-primary text-sm py-2"
                  >
                    View all {sports.length} sports →
                  </button>
                )}
              </div>
            </div>
          )}
          {tab === 'sports' && (
            <>
              <div className="sticky top-0 z-10 -mx-4 px-4 py-2 bg-dark-900">
                <SearchInput value={sportSearch} onChange={setSportSearch} placeholder="Search sports…" aria-label="Search sports" />
              </div>
              <ul className="space-y-2">
              {sports.map((sport) => (
                <li key={sport.id}>
                  <SportCard sport={sport} eventId={eventId} />
                </li>
              ))}
              </ul>
            </>
          )}
          {tab === 'points' && (
            <EventPointsTable rows={points_table} />
          )}
        </div>
      </div>
    </PageShell>
  );
}
