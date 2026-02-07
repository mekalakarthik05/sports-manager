'use client';

import { useCallback, useEffect, useState } from 'react';
import { teamsApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchInput } from '@/components/ui/SearchInput';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Team } from '@/types';

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', logo_url: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadTeams = useCallback(() => {
    setLoading(true);
    setError(null);
    teamsApi
      .list({ search: search.trim() || undefined })
      .then((res) => setTeams(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) {
      setFormError('Team name required');
      return;
    }
    setSubmitting(true);
    try {
      await teamsApi.create({
        name: form.name.trim(),
        logo_url: form.logo_url.trim() || undefined,
      });
      setForm({ name: '', logo_url: '' });
      setShowForm(false);
      loadTeams();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create team');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(teamId: string) {
    if (deleteConfirm !== teamId) {
      setDeleteConfirm(teamId);
      return;
    }
    try {
      await teamsApi.delete(teamId);
      setDeleteConfirm(null);
      loadTeams();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete team');
    }
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="sticky top-0 z-10 -mx-4 px-4 py-2 bg-dark-900">
        <SearchInput value={search} onChange={setSearch} placeholder="Search teams…" aria-label="Search teams" />
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Teams</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Team'}
        </Button>
      </div>
      {showForm && (
        <Card>
          <form onSubmit={handleCreate} className="space-y-3">
            <Input
              label="Team name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Team A"
              required
            />
            <Input
              label="Logo URL (optional)"
              value={form.logo_url}
              onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))}
              placeholder="https://..."
            />
            {formError && <p className="text-sm text-red-400">{formError}</p>}
            <Button type="submit" fullWidth loading={submitting}>
              Create Team
            </Button>
          </form>
        </Card>
      )}
      {error && (
        <div className="rounded-xl bg-red-900/20 border border-red-500/50 p-4 text-red-400 text-sm">
          {error}
        </div>
      )}
      {loading && (
        <>
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </>
      )}
      {!loading && !error && teams.length === 0 && (
        <Card className="text-center py-8 text-slate-500">
          No teams. Create one above.
        </Card>
      )}
      {!loading && !error && teams.length > 0 && (
        <ul className="space-y-2">
          {teams.map((team) => (
            <li key={team.id}>
              <Card className="flex items-center justify-between gap-2 p-3">
                <p className="font-medium text-slate-100 flex-1">{team.name}</p>
                {deleteConfirm === team.id ? (
                  <>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(team.id)}>Confirm?</Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                  </>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(team.id)}>Delete</Button>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
