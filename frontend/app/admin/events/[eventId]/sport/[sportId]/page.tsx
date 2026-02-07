'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { sportsApi, matchesApi, pointsApi, teamsApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { formatDateTime, getMatchTypeLabel } from '@/lib/utils';
import { getCategoryLabel } from '@/lib/utils';
import type { Sport, Match, SportPointsRow } from '@/types';
import type { MatchStatus } from '@/types';

const STATUS_OPTIONS: { id: MatchStatus; label: string }[] = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'live', label: 'Live' },
  { id: 'completed', label: 'Completed' },
];

export default function AdminSportManagePage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const sportId = params.sportId as string;
  const [tab, setTab] = useState<'teams' | 'matches' | 'playoffs' | 'points'>('matches');
  const [sport, setSport] = useState<Sport | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [playoffs, setPlayoffs] = useState<Match[]>([]);
  const [pointsTable, setPointsTable] = useState<SportPointsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showAddMatch, setShowAddMatch] = useState(false);
  const [eventTeams, setEventTeams] = useState<any[]>([]);
  const [sportTeams, setSportTeams] = useState<any[]>([]);
  const [newMatch, setNewMatch] = useState({ team1_id: '', team2_id: '', scheduled_at: '', match_type: 'group', live_stream_url: '' });
  const [editMatchId, setEditMatchId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    status: MatchStatus;
    team1_score: string;
    team2_score: string;
    winner_team_id: string;
    live_stream_url: string;
  }>({ status: 'upcoming', team1_score: '', team2_score: '', winner_team_id: '', live_stream_url: '' });
  const [deleteMatchId, setDeleteMatchId] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!sportId) return;
    setLoading(true);
    setError(null);
      Promise.all([
        sportsApi.get(sportId),
        matchesApi.listBySport(sportId),
        // event teams (for Teams tab) and sport-specific mapping for match dropdowns
        teamsApi.listByEvent(eventId),
        sportsApi.getTeams(sportId),
        matchesApi.getPlayoffs(sportId),
        pointsApi.sport(sportId),
      ])
        .then(([sportRes, matchesRes, eventTeamsRes, sportTeamsRes, playoffsRes, pointsRes]) => {
          setSport(sportRes.data);
          setMatches(Array.isArray(matchesRes.data) ? matchesRes.data : []);
          setEventTeams(Array.isArray(eventTeamsRes.data) ? eventTeamsRes.data : []);
          setSportTeams(Array.isArray(sportTeamsRes.data) ? sportTeamsRes.data : []);
          setPlayoffs(Array.isArray(playoffsRes.data) ? playoffsRes.data : []);
          setPointsTable(Array.isArray(pointsRes.data) ? pointsRes.data : []);
        })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sportId]);


  useEffect(() => {
    load();
  }, [load]);

  function openEdit(match: Match) {
    setEditMatchId(match.id);
    setEditForm({
      status: match.status,
      team1_score: match.team1_score ?? '',
      team2_score: match.team2_score ?? '',
      winner_team_id: match.winner_team_id ?? '',
      live_stream_url: match.live_stream_url ?? '',
    });
  }

  async function handleSaveMatch(e: React.FormEvent) {
    e.preventDefault();
    if (!editMatchId) return;
    try {
      await matchesApi.update(editMatchId, {
        status: editForm.status,
        team1_score: editForm.team1_score || undefined,
        team2_score: editForm.team2_score || undefined,
        winner_team_id: editForm.winner_team_id || undefined,
        live_stream_url: editForm.live_stream_url || undefined,
      });
      setEditMatchId(null);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update match');
    }
  }

  async function handleGeneratePlayoffs() {
    setGenerating(true);
    setError(null);
    try {
      await sportsApi.generatePlayoffs(sportId);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate playoffs');
    } finally {
      setGenerating(false);
    }
  }

  async function handleDeleteMatch(matchId: string) {
    if (deleteMatchId !== matchId) {
      setDeleteMatchId(matchId);
      return;
    }
    try {
      await matchesApi.delete(matchId);
      setDeleteMatchId(null);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete match');
    }
  }

  if (loading && !sport) {
    return (
      <div className="px-4 py-6 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !sport) {
    return (
      <div className="px-4 py-4">
        <ErrorState
          message={error || 'Sport not found'}
          onRetry={load}
          onBack={() => router.push(`/admin/events/${eventId}`)}
        />
      </div>
    );
  }

  const tabs = [
    { id: 'teams' as const, label: 'Teams' },
    { id: 'matches' as const, label: 'Matches' },
    { id: 'playoffs' as const, label: 'Playoffs' },
    { id: 'points' as const, label: 'Points' },
  ];
  const displayMatches = tab === 'playoffs' ? playoffs : matches;

  return (
    <div className="px-4 py-6 space-y-6">
      <Link href={`/admin/events/${eventId}`} className="text-sm text-slate-500 hover:text-slate-300 block">
        ← Event
      </Link>
      <h2 className="text-lg font-semibold text-slate-100">
        {sport.name} ({getCategoryLabel(sport.category)})
      </h2>
      <p className="text-sm text-slate-500">Playoff format: {sport.playoff_format}</p>

      {tab === 'playoffs' && playoffs.length === 0 && matches.length > 0 && (
        <Card className="p-4">
          <p className="text-sm text-slate-400 mb-3">
            Generate playoff matches from the points table (top 2-4 teams). Requires points table to be filled.
          </p>
          <Button fullWidth onClick={handleGeneratePlayoffs} loading={generating}>
            Generate Playoffs
          </Button>
        </Card>
      )}

      {tab === 'playoffs' && playoffs.length > 0 && (
        <p className="text-sm text-slate-500">Playoff matches below. Edit result to set winner/scores.</p>
      )}

      <Tabs
  tabs={tabs}
  activeId={tab}
  onChange={(id) => setTab(id as 'teams' | 'matches' | 'playoffs' | 'points')}
  sticky={false}
/>


      {tab === 'teams' && (
        <div className="space-y-2">
          {eventTeams.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">No teams registered for this event yet.</p>
          ) : (
            <ul className="space-y-2">
              {eventTeams.map((t) => (
                <Card key={t.id} padding="sm" className="flex items-center gap-2">
                  <span className="flex-1 font-medium text-slate-100">{t.name}</span>
                </Card>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'points' && (
        <div className="space-y-2">
          {pointsTable.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">Points table updates when you set match results to Completed with a winner.</p>
          ) : (
            <ul className="space-y-2">
              {pointsTable.map((row, i) => (
                <Card key={row.id} padding="sm" className="flex items-center gap-2">
                  <span className="w-6 text-slate-400 font-medium">{i + 1}</span>
                  <span className="flex-1 font-medium text-slate-100">{row.team_name}</span>
                  <span className="text-slate-400">P: {row.matches_played} W: {row.wins} Pts: {row.points}</span>
                </Card>
              ))}
            </ul>
          )}
        </div>
      )}

      {(tab === 'matches' || tab === 'playoffs') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">{displayMatches.length} matches</span>
            <Button size="sm" onClick={() => setShowAddMatch(!showAddMatch)}>
              {showAddMatch ? 'Cancel' : '+ Add Match'}
            </Button>
          </div>
          {showAddMatch && (
            <Card className="p-4">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newMatch.team1_id || !newMatch.team2_id) {
                    setError('Select both teams');
                    return;
                  }
                  if (newMatch.team1_id === newMatch.team2_id) {
                    setError('Teams must be different');
                    return;
                  }
                  setError(null);
                  try {
                    await matchesApi.create({
                      sport_id: sportId,
                      team1_id: newMatch.team1_id,
                      team2_id: newMatch.team2_id,
                      match_type: newMatch.match_type as any,
                      scheduled_at: newMatch.scheduled_at || null,
                      live_stream_url: newMatch.live_stream_url || null,
                    });
                    setShowAddMatch(false);
                    setNewMatch({ team1_id: '', team2_id: '', scheduled_at: '', match_type: 'group', live_stream_url: '' });
                    load();
                  } catch (err: unknown) {
                    setError(err instanceof Error ? err.message : 'Failed to create match');
                  }
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Team A</label>
                  <select
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-dark-700 border border-dark-500 text-slate-100"
                    value={newMatch.team1_id}
                    onChange={(e) => setNewMatch((f) => ({ ...f, team1_id: e.target.value }))}
                    required
                  >
                    <option value="">Select team</option>
                    {(sportTeams.length ? sportTeams : eventTeams).map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Team B</label>
                  <select
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-dark-700 border border-dark-500 text-slate-100"
                    value={newMatch.team2_id}
                    onChange={(e) => setNewMatch((f) => ({ ...f, team2_id: e.target.value }))}
                    required
                  >
                    <option value="">Select team</option>
                    {(sportTeams.length ? sportTeams : eventTeams).map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Date & time (optional)</label>
                  <input
                    type="datetime-local"
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-dark-700 border border-dark-500 text-slate-100"
                    value={newMatch.scheduled_at}
                    onChange={(e) => setNewMatch((f) => ({ ...f, scheduled_at: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Match type</label>
                  <select
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-dark-700 border border-dark-500 text-slate-100"
                    value={newMatch.match_type}
                    onChange={(e) => setNewMatch((f) => ({ ...f, match_type: e.target.value }))}
                  >
                    <option value="group">Group Stage</option>
                    <option value="qualifier1">Qualifier 1</option>
                    <option value="eliminator">Eliminator</option>
                    <option value="qualifier2">Qualifier 2</option>
                    <option value="semi">Semi-Final</option>
                    <option value="final">Final</option>
                  </select>
                </div>
                <Input
                  label="Live stream URL (optional)"
                  value={newMatch.live_stream_url}
                  onChange={(e) => setNewMatch((f) => ({ ...f, live_stream_url: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=..."
                />
                {error && <p className="text-sm text-red-400">{error}</p>}
                <div className="flex gap-2">
                  <Button type="submit">Create match</Button>
                  <Button type="button" variant="ghost" onClick={() => { setShowAddMatch(false); setError(null); }}>Cancel</Button>
                </div>
              </form>
            </Card>
          )}
          <ul className="space-y-3">
            {displayMatches.length === 0 && !showAddMatch && (
              <li className="text-sm text-slate-500 py-4 text-center">
                {tab === 'playoffs' ? 'No playoff matches. Generate above.' : 'No matches yet.'}
              </li>
            )}
            {displayMatches.map((match) => (
            <li key={match.id}>
              <Card className="p-4 space-y-2">
                {editMatchId === match.id ? (
                  <form onSubmit={handleSaveMatch} className="space-y-3">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Status</label>
                      <select
                        className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-dark-700 border border-dark-500 text-slate-100"
                        value={editForm.status}
                        onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as MatchStatus }))}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label="Team 1 score"
                      value={editForm.team1_score}
                      onChange={(e) => setEditForm((f) => ({ ...f, team1_score: e.target.value }))}
                      placeholder="0"
                    />
                    <Input
                      label="Team 2 score"
                      value={editForm.team2_score}
                      onChange={(e) => setEditForm((f) => ({ ...f, team2_score: e.target.value }))}
                      placeholder="0"
                    />
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Winner</label>
                      <select
                        className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-dark-700 border border-dark-500 text-slate-100"
                        value={editForm.winner_team_id}
                        onChange={(e) => setEditForm((f) => ({ ...f, winner_team_id: e.target.value }))}
                      >
                        <option value="">—</option>
                        <option value={match.team1_id}>{match.team1_name}</option>
                        <option value={match.team2_id}>{match.team2_name}</option>
                      </select>
                    </div>
                    <Input
                      label="Live stream URL (optional)"
                      value={editForm.live_stream_url}
                      onChange={(e) => setEditForm((f) => ({ ...f, live_stream_url: e.target.value }))}
                      placeholder="https://..."
                    />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm">Save</Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setEditMatchId(null)}>Cancel</Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-500">{getMatchTypeLabel(match.match_type)}</span>
                      {match.scheduled_at && (
                        <span className="text-xs text-slate-500">{formatDateTime(match.scheduled_at)}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex-1 truncate">{match.team1_name}</span>
                      <span className="text-slate-500">
                        {match.status === 'completed' && match.team1_score != null && match.team2_score != null
                          ? `${match.team1_score} – ${match.team2_score}`
                          : match.status}
                      </span>
                      <span className="flex-1 truncate text-right">{match.team2_name}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" onClick={() => openEdit(match)}>Edit result</Button>
                      {deleteMatchId === match.id ? (
                        <>
                          <Button size="sm" variant="danger" onClick={() => handleDeleteMatch(match.id)}>Confirm delete?</Button>
                          <Button size="sm" variant="ghost" onClick={() => setDeleteMatchId(null)}>Cancel</Button>
                        </>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteMatch(match.id)}>Delete</Button>
                      )}
                    </div>
                  </>
                )}
              </Card>
            </li>
          ))}
        </ul>        </div>      )}
    </div>
  );
}
