'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { eventsApi, sportsApi, teamsApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchInput } from '@/components/ui/SearchInput';
import { Tabs } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { getCategoryLabel } from '@/lib/utils';
import type { Event, Sport, Team } from '@/types';
import type { SportCategory, PlayoffFormat } from '@/types';

const CATEGORIES: { id: SportCategory; label: string }[] = [
  { id: 'men', label: 'Men' },
  { id: 'women', label: 'Women' },
];
const PLAYOFF_FORMATS: { id: PlayoffFormat; label: string }[] = [
  { id: 'knockout', label: 'Knockout' },
  { id: 'ipl', label: 'IPL' },
  { id: 'wpl', label: 'WPL' },
];

export default function AdminEventManagePage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const [tab, setTab] = useState<'sports' | 'teams'>('sports');
  const [event, setEvent] = useState<Event | null>(null);
  const [sports, setSports] = useState<Sport[]>([]);
  const [eventTeams, setEventTeams] = useState<Team[]>([]);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddSport, setShowAddSport] = useState(false);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [sportForm, setSportForm] = useState<{ category: SportCategory; name: string; playoff_format: PlayoffFormat }>({
    category: 'men',
    name: '',
    playoff_format: 'knockout',
  });
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteSportId, setDeleteSportId] = useState<string | null>(null);
  const [removeTeamId, setRemoveTeamId] = useState<string | null>(null);
  const [sportSearch, setSportSearch] = useState('');
  const [teamSearch, setTeamSearch] = useState('');

  const load = useCallback((sSearch?: string, tSearch?: string) => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    const sr = sSearch !== undefined ? sSearch : sportSearch;
    const tr = tSearch !== undefined ? tSearch : teamSearch;
    Promise.all([
      eventsApi.get(eventId),
      sportsApi.listByEvent(eventId, { search: sr }),
      teamsApi.listByEvent(eventId, { search: tr }),
      teamsApi.list(),
    ])
      .then(([eventRes, sportsRes, teamsRes, myTeamsRes]) => {
        setEvent(eventRes.data);
        setSports(Array.isArray(sportsRes.data) ? sportsRes.data : []);
        setEventTeams(Array.isArray(teamsRes.data) ? teamsRes.data : []);
        setMyTeams(Array.isArray(myTeamsRes.data) ? myTeamsRes.data : []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [eventId, sportSearch, teamSearch]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAddSport(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!sportForm.name.trim()) {
      setFormError('Sport name required');
      return;
    }
    setSubmitting(true);
    try {
      await sportsApi.create({
        event_id: eventId,
        category: sportForm.category,
        name: sportForm.name.trim(),
        playoff_format: sportForm.playoff_format,
      });
      setSportForm({ category: 'men', name: '', playoff_format: 'knockout' });
      setShowAddSport(false);
      load();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to add sport');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteSport(sportId: string) {
    if (deleteSportId !== sportId) {
      setDeleteSportId(sportId);
      return;
    }
    try {
      await sportsApi.delete(sportId);
      setDeleteSportId(null);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete sport');
    }
  }

  async function handleAddTeamToEvent(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!selectedTeamId) {
      setFormError('Select a team');
      return;
    }
    setSubmitting(true);
    try {
      await teamsApi.addToEvent(eventId, selectedTeamId);
      setSelectedTeamId('');
      setShowAddTeam(false);
      load();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to add team');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemoveTeamFromEvent(teamId: string) {
    if (removeTeamId !== teamId) {
      setRemoveTeamId(teamId);
      return;
    }
    try {
      await teamsApi.removeFromEvent(eventId, teamId);
      setRemoveTeamId(null);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to remove team');
    }
  }

  if (loading && !event) {
    return (
      <div className="px-4 py-6 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="px-4 py-4">
        <ErrorState
          message={error || 'Event not found'}
          onRetry={load}
          onBack={() => router.push('/admin/events')}
        />
      </div>
    );
  }

  const tabs = [
    { id: 'sports' as const, label: 'Sports' },
    { id: 'teams' as const, label: 'Teams' },
  ];
  const availableTeams = myTeams.filter((t) => !eventTeams.some((et) => et.id === t.id));

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/admin/events" className="text-slate-500 hover:text-slate-300 text-sm">
          ← Events
        </Link>
      </div>
      <h2 className="text-lg font-semibold text-slate-100">{event.name}</h2>
      <Tabs tabs={tabs} activeId={tab} onChange={(id) => setTab(id as 'sports' | 'teams')} sticky={false} />

      {tab === 'sports' && (
        <div className="space-y-4">
          <div className="sticky top-0 z-10 -mx-4 px-4 py-2 bg-dark-900">
            <SearchInput value={sportSearch} onChange={setSportSearch} placeholder="Search sports…" aria-label="Search sports" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Sports in this event</span>
            <Button size="sm" onClick={() => setShowAddSport(!showAddSport)}>
              {showAddSport ? 'Cancel' : '+ Add Sport'}
            </Button>
          </div>
          {showAddSport && (
            <Card>
              <form onSubmit={handleAddSport} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
                  <select
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-dark-700 border border-dark-500 text-slate-100"
                    value={sportForm.category}
                    onChange={(e) => setSportForm((f) => ({ ...f, category: e.target.value as SportCategory }))}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Sport name"
                  value={sportForm.name}
                  onChange={(e) => setSportForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Cricket"
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Playoff format</label>
                  <select
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-dark-700 border border-dark-500 text-slate-100"
                    value={sportForm.playoff_format}
                    onChange={(e) => setSportForm((f) => ({ ...f, playoff_format: e.target.value as PlayoffFormat }))}
                  >
                    {PLAYOFF_FORMATS.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
                {formError && <p className="text-sm text-red-400">{formError}</p>}
                <Button type="submit" fullWidth loading={submitting}>
                  Add Sport
                </Button>
              </form>
            </Card>
          )}
          <ul className="space-y-2">
            {sports.length === 0 && !showAddSport && (
              <li className="text-sm text-slate-500 py-4 text-center">No sports yet. Add one above.</li>
            )}
            {sports.map((sport) => (
              <li key={sport.id}>
                <Card className="flex items-center justify-between gap-2 p-3">
                  <Link
                    href={`/admin/events/${eventId}/sport/${sport.id}`}
                    className="flex-1 min-w-0"
                  >
                    <p className="font-medium text-slate-100">{sport.name}</p>
                    <p className="text-sm text-slate-500">{getCategoryLabel(sport.category)} · {sport.playoff_format}</p>
                  </Link>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/${eventId}/sport/${sport.id}`} className="text-sm text-slate-400 hover:text-slate-200">
                      View
                    </Link>
                    {deleteSportId === sport.id ? (
                      <>
                        <Button size="sm" variant="danger" onClick={() => handleDeleteSport(sport.id)}>Confirm?</Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteSportId(null)}>Cancel</Button>
                      </>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteSport(sport.id)}>Delete</Button>
                    )}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'teams' && (
        <div className="space-y-4">
          <div className="sticky top-0 z-10 -mx-4 px-4 py-2 bg-dark-900">
            <SearchInput value={teamSearch} onChange={setTeamSearch} placeholder="Search teams…" aria-label="Search teams" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Teams in this event</span>
            <Button size="sm" onClick={() => setShowAddTeam(!showAddTeam)} disabled={availableTeams.length === 0}>
              {showAddTeam ? 'Cancel' : '+ Add Team'}
            </Button>
          </div>
          {showAddTeam && availableTeams.length > 0 && (
            <Card>
              <form onSubmit={handleAddTeamToEvent} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Team</label>
                  <select
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-dark-700 border border-dark-500 text-slate-100"
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    required
                  >
                    <option value="">Select team</option>
                    {availableTeams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                {formError && <p className="text-sm text-red-400">{formError}</p>}
                <Button type="submit" fullWidth loading={submitting}>
                  Add to Event
                </Button>
              </form>
            </Card>
          )}
          {availableTeams.length === 0 && !showAddTeam && myTeams.length > 0 && (
            <p className="text-sm text-slate-500">All your teams are already in this event.</p>
          )}
          {myTeams.length === 0 && (
            <p className="text-sm text-slate-500">
              Create teams first in <Link href="/admin/teams" className="text-accent-primary">Teams</Link>.
            </p>
          )}
          <ul className="space-y-2">
            {eventTeams.length === 0 && (
              <li className="text-sm text-slate-500 py-4 text-center">No teams in this event yet.</li>
            )}
            {eventTeams.map((team) => (
              <li key={team.id}>
                <Card className="flex items-center justify-between gap-2 p-3">
                  <p className="font-medium text-slate-100">{team.name}</p>
                  {removeTeamId === team.id ? (
                    <>
                      <Button size="sm" variant="danger" onClick={() => handleRemoveTeamFromEvent(team.id)}>Confirm?</Button>
                      <Button size="sm" variant="ghost" onClick={() => setRemoveTeamId(null)}>Cancel</Button>
                    </>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => handleRemoveTeamFromEvent(team.id)}>Remove</Button>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
