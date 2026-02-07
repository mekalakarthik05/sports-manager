export type SportCategory = 'men' | 'women';
export type PlayoffFormat = 'knockout' | 'ipl' | 'wpl';
export type MatchStatus = 'upcoming' | 'live' | 'completed';
export type MatchType =
  | 'group'
  | 'qualifier1'
  | 'eliminator'
  | 'qualifier2'
  | 'semi'
  | 'final';

export type AdminRole = 'super_admin' | 'admin';

export interface Admin {
  id: string;
  name: string;
  username: string;
  role?: AdminRole;
}

export interface Event {
  id: string;
  name: string;
  banner_url: string | null;
  start_date: string;
  end_date: string;
  created_at?: string;
  updated_at?: string;
  sports_count?: number;
}

export interface Team {
  id: string;
  name: string;
  logo_url: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Sport {
  id: string;
  event_id: string;
  category: SportCategory;
  name: string;
  playoff_format: PlayoffFormat;
  created_at?: string;
  updated_at?: string;
}

export interface Match {
  id: string;
  sport_id: string;
  team1_id: string;
  team2_id: string;
  match_type: MatchType;
  scheduled_at: string | null;
  status: MatchStatus;
  winner_team_id: string | null;
  team1_score: string | null;
  team2_score: string | null;
  live_stream_url: string | null;
  team1_name?: string;
  team2_name?: string;
  team1_logo?: string | null;
  team2_logo?: string | null;
  winner_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SportPointsRow {
  id: string;
  sport_id: string;
  team_id: string;
  team_name: string;
  team_logo?: string | null;
  matches_played: number;
  wins: number;
  losses: number;
  points: number;
  updated_at?: string;
}

export interface EventPointsRow {
  id: string;
  event_id: string;
  team_id: string;
  team_name: string;
  team_logo?: string | null;
  gold: number;
  silver: number;
  bronze: number;
  total_points: number;
  updated_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
