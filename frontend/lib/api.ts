import type {
  Admin,
  ApiResponse,
  Event,
  Sport,
  Match,
  Team,
  EventPointsRow,
  SportPointsRow,
  SportCategory,
  PlayoffFormat,
  MatchType,
  MatchStatus,
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, { ...options, headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || res.statusText || 'Request failed');
  }
  return json as ApiResponse<T>;
}

export const eventsApi = {
  list: (params?: { search?: string }) => {
    const q = params?.search ? `?search=${encodeURIComponent(params.search)}` : '';
    return api<Event[]>(`/events${q}`);
  },
  get: (id: string) => api<Event>(`/events/${id}`),
  dashboard: (id: string) =>
    api<Event & { sports: Sport[]; sports_count: number; points_table: EventPointsRow[] }>(
      `/events/${id}/dashboard`
    ),
  create: (body: { name: string; banner_url?: string; start_date: string; end_date: string }) =>
    api<Event>(`/events`, { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Event>) =>
    api<Event>(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id: string) => api<{ deleted: boolean }>(`/events/${id}`, { method: 'DELETE' }),
};

export const sportsApi = {
  listByEvent: (eventId: string, params?: { category?: string; search?: string }) => {
    const sp = new URLSearchParams();
    if (params?.category) sp.set('category', params.category);
    if (params?.search) sp.set('search', params.search);
    const q = sp.toString() ? `?${sp.toString()}` : '';
    return api<Sport[]>(`/sports/event/${eventId}${q}`);
  },
  get: (id: string) => api<Sport>(`/sports/${id}`),
  getTeams: (sportId: string) => api<Team[]>(`/sports/${sportId}/teams`),
  create: (body: { event_id: string; category: SportCategory; name: string; playoff_format?: PlayoffFormat }) =>
    api<Sport>(`/sports`, { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Sport>) =>
    api<Sport>(`/sports/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id: string) => api<{ deleted: boolean }>(`/sports/${id}`, { method: 'DELETE' }),
  generatePlayoffs: (id: string) =>
    api<Match[]>(`/sports/${id}/playoffs/generate`, { method: 'POST' }),
};

export const matchesApi = {
  listBySport: (sportId: string, params?: { status?: string; search?: string }) => {
    const sp = new URLSearchParams();
    if (params?.status) sp.set('status', params.status);
    if (params?.search) sp.set('search', params.search);
    const q = sp.toString() ? `?${sp.toString()}` : '';
    return api<Match[]>(`/matches/sport/${sportId}${q}`);
  },
  getPlayoffs: (sportId: string) => api<Match[]>(`/matches/sport/${sportId}/playoffs`),
  get: (id: string) => api<Match>(`/matches/${id}`),
  create: (body: {
    sport_id: string;
    team1_id: string;
    team2_id: string;
    match_type?: MatchType;
    scheduled_at?: string | null;
    status?: MatchStatus;
    live_stream_url?: string | null;
  }) => api<Match>(`/matches`, { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Match>) =>
    api<Match>(`/matches/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id: string) => api<{ deleted: boolean }>(`/matches/${id}`, { method: 'DELETE' }),
};

export const teamsApi = {
  list: (params?: { event_id?: string; search?: string }) => {
    const sp = new URLSearchParams();
    if (params?.event_id) sp.set('event_id', params.event_id);
    if (params?.search?.trim()) sp.set('search', params.search.trim());
    const q = sp.toString() ? `?${sp.toString()}` : '';
    return api<Team[]>(`/teams${q}`);
  },
  listByEvent: (eventId: string, params?: { search?: string }) => {
    const q = params?.search?.trim() ? `?search=${encodeURIComponent(params.search)}` : '';
    return api<Team[]>(`/teams/event/${eventId}${q}`);
  },
  get: (id: string) => api<Team>(`/teams/${id}`),
  create: (body: { name: string; logo_url?: string }) =>
    api<Team>(`/teams`, { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Team>) =>
    api<Team>(`/teams/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id: string) => api<{ deleted: boolean }>(`/teams/${id}`, { method: 'DELETE' }),
  addToEvent: (eventId: string, teamId: string) =>
    api<{ added: boolean }>(`/teams/event/${eventId}/team/${teamId}`, { method: 'POST' }),
  removeFromEvent: (eventId: string, teamId: string) =>
    api<{ removed: boolean }>(`/teams/event/${eventId}/team/${teamId}`, { method: 'DELETE' }),
};

export const pointsApi = {
  sport: (sportId: string) => api<SportPointsRow[]>(`/points/sport/${sportId}`),
  event: (eventId: string) => api<EventPointsRow[]>(`/points/event/${eventId}`),
  updateSportRow: (
    sportId: string,
    teamId: string,
    body: Partial<SportPointsRow>
  ) =>
    api<SportPointsRow>(`/points/sport/${sportId}/team/${teamId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
};

export const adminApi = {
  login: async (username: string, password: string) => {
    const res = await api<{ token: string; admin: Admin }>(`/admin/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    return res.data;
  },

  register: async (name: string, username: string, password: string) => {
    const res = await api<{ id: string; name: string; username: string }>(`/admin/register`, {
      method: 'POST',
      body: JSON.stringify({ name: (name || '').trim(), username: (username || '').trim(), password }),
    });
    return res.data;
  },

  listMyEvents: async (search?: string) => {
    const q = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
    const res = await api<Event[]>(`/admin/events${q}`);
    return res.data;
  },
};
