'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi, eventsApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchInput } from '@/components/ui/SearchInput';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDateRange } from '@/lib/utils';
import type { Event } from '@/types';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', banner_url: '', start_date: '', end_date: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadEvents = useCallback((searchTerm?: string) => {
    setLoading(true);
    setError(null);
    adminApi
      .listMyEvents(searchTerm !== undefined ? searchTerm : search)
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    loadEvents(search);
  }, [search]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!form.name || !form.start_date || !form.end_date) {
      setFormError('Name, start date and end date required');
      return;
    }
    setSubmitting(true);
    try {
      await eventsApi.create({
        name: form.name,
        banner_url: form.banner_url || undefined,
        start_date: form.start_date,
        end_date: form.end_date,
      });
      setForm({ name: '', banner_url: '', start_date: '', end_date: '' });
      setShowForm(false);
      loadEvents(search);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(eventId: string) {
    if (deleteConfirm !== eventId) {
      setDeleteConfirm(eventId);
      return;
    }
    try {
      await eventsApi.delete(eventId);
      setDeleteConfirm(null);
      loadEvents(search);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="sticky top-0 z-10 -mx-4 px-4 py-2 bg-dark-900">
        <SearchInput value={search} onChange={setSearch} placeholder="Search events…" aria-label="Search events" />
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Events</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Event'}
        </Button>
      </div>
      {showForm && (
        <Card>
          <form onSubmit={handleCreate} className="space-y-3">
            <Input
              label="Event name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Annual Sports Meet"
              required
            />
            <Input
              label="Banner URL (optional)"
              value={form.banner_url}
              onChange={(e) => setForm((f) => ({ ...f, banner_url: e.target.value }))}
              placeholder="https://..."
            />
            <Input
              label="Start date"
              type="date"
              value={form.start_date}
              onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
              required
            />
            <Input
              label="End date"
              type="date"
              value={form.end_date}
              onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
              required
            />
            {formError && <p className="text-sm text-red-400">{formError}</p>}
            <Button type="submit" fullWidth loading={submitting}>
              Create Event
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
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </>
      )}
      {!loading && !error && events.length === 0 && (
        <Card className="text-center py-8 text-slate-500">
          No events. Create one above.
        </Card>
      )}
      {!loading && !error && events.length > 0 && (
        <ul className="space-y-2">
          {events.map((event) => (
            <li key={event.id}>
              <Card className="flex items-center justify-between gap-2 p-3">
                <Link href={`/admin/events/${event.id}`} className="flex-1 min-w-0 card-tap">
                  <div>
                    <p className="font-medium text-slate-100">{event.name}</p>
                    <p className="text-sm text-slate-500">
                      {formatDateRange(event.start_date, event.end_date)}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/${event.id}`} className="text-sm text-slate-400 hover:text-slate-200">
                    View
                  </Link>
                  {deleteConfirm === event.id ? (
                    <>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(event.id)}>
                        Confirm?
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(null)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(event.id)}>
                      Delete
                    </Button>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
