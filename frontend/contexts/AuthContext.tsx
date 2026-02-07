'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Admin } from '@/types';

interface AuthContextValue {
  admin: Admin | null;
  token: string | null;
  login: (token: string, admin: Admin) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'admin_token';
const ADMIN_KEY = 'admin_data';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = localStorage.getItem(TOKEN_KEY);
    const a = localStorage.getItem(ADMIN_KEY);
    if (t && a) {
      try {
        const parsed = JSON.parse(a) as Admin;
        setToken(t);
        setAdmin({
          id: parsed.id,
          name: parsed.name ?? parsed.username ?? '',
          username: parsed.username,
          role: parsed.role,
        });
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(ADMIN_KEY);
      }
    }
  }, []);

  const login = useCallback((t: string, a: Admin) => {
    setToken(t);
    setAdmin(a);
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(a));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  }, []);

  const value: AuthContextValue = {
    admin,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!admin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
