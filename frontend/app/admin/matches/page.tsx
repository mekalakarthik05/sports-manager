'use client';

import type { Team } from '@/types';
import { useEffect, useState } from 'react';
import { eventsApi, sportsApi, matchesApi, teamsApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { formatDateTime, getMatchTypeLabel } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Event, Sport, Match } from '@/types';

export default function AdminMatchesPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedSportId, setSelectedSportId] = useState<string | null>(null);
  const [matchSearch, setMatchSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    eventsApi
      .list()
      .then((res) => setEvents(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!selectedEventId) {
      setSports([]);
      setSelectedSportId(null);
      setMatches([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    sportsApi
      .listByEvent(selectedEventId)
      .then((res) => {
        setSports(Array.isArray(res.data) ? res.data : []);
        setSelectedSportId(null);
        setMatches([]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedEventId]);

  useEffect(() => {
    if (!selectedSportId) {
      setMatches([]);
      return;
    }
    setLoading(true);
    matchesApi
      .listBySport(selectedSportId, { search: matchSearch.trim() || undefined })
      .then((res) => setMatches(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedSportId, matchSearch]);

  return (
    <div className="px-4 py-6 space-y-6">
      <h2 className="text-lg font-semibold text-slate-100">Matches</h2>
      {error && (
        <div className="rounded-xl bg-red-900/20 border border-red-500/50 p-4 text-red-400 text-sm">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">Event</label>
        <select
          className="w-full px-4 py-2.5 rounded-lg bg-dark-700 border border-dark-500 text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
          value={selectedEventId ?? ''}
          onChange={(e) => setSelectedEventId(e.target.value || null)}
        >
          <option value="">Select event</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>
      {selectedEventId && (
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Sport</label>
          <select
            className="w-full px-4 py-2.5 rounded-lg bg-dark-700 border border-dark-500 text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
            value={selectedSportId ?? ''}
            onChange={(e) => setSelectedSportId(e.target.value || null)}
          >
            <option value="">Select sport</option>
            {sports.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.category})
              </option>
            ))}
          </select>
        </div>
      )}
      {selectedSportId && (
        <div className="sticky top-0 z-10 -mx-4 px-4 py-2 bg-dark-900">
          <SearchInput value={matchSearch} onChange={setMatchSearch} placeholder="Search matches (by team name)…" aria-label="Search matches" />
        </div>
      )}
      {loading && (
        <>
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </>
      )}
      {!loading && selectedSportId && matches.length === 0 && (
        <Card className="text-center py-8 text-slate-500">
          No matches for this sport. Create events and sports first, then add matches from the sport page.
        </Card>
      )}
      {!loading && matches.length > 0 && (
        <ul className="space-y-2">
          {matches.map((match) => (
            <li key={match.id}>
              <Card padding="sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500">{getMatchTypeLabel(match.match_type)}</p>
                    <p className="font-medium text-slate-100 truncate">
                      {match.team1_name} vs {match.team2_name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatDateTime(match.scheduled_at)} · {match.status}
                    </p>
                  </div>
                  <a
                    href={`/${selectedEventId}/sport/${selectedSportId}`}
                    className="flex-shrink-0 text-sm text-accent-primary"
                  >
                    View
                  </a>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
