'use client';

import { useCallback, useEffect, useState } from 'react';
import { eventsApi } from '@/lib/api';
import { PageShell } from '@/components/layout/PageShell';
import { EventCard } from '@/components/events/EventCard';
import { EventCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SearchInput } from '@/components/ui/SearchInput';
import type { Event } from '@/types';

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchEvents = useCallback((searchTerm?: string) => {
    setError(null);
    setLoading(true);
    eventsApi
      .list({ search: searchTerm ?? search })
      .then((res) => {
        setEvents(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load events');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    eventsApi
      .list({ search })
      .then((res) => {
        if (!cancelled) setEvents(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load events');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search]);

  return (
    <PageShell title="Events" showBottomNav>
      <div className="px-4 py-4 space-y-4">
        <div className="sticky top-0 z-10 -mx-4 px-4 py-2 bg-dark-900">
          <SearchInput value={search} onChange={setSearch} placeholder="Search events…" aria-label="Search events" />
        </div>
        {loading && (
          <>
            <EventCardSkeleton />
            <EventCardSkeleton />
            <EventCardSkeleton />
          </>
        )}
        {!loading && error && (
          <ErrorState message={error} onRetry={() => fetchEvents(search)} />
        )}
        {!loading && !error && events.length === 0 && (
          <EmptyState message="No events yet. Check back later." icon="🏆" />
        )}
        {!loading && !error && events.length > 0 && (
          <ul className="space-y-4">
            {events.map((event) => (
              <li key={event.id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  );
}
