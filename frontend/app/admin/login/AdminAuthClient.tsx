'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

type TabMode = 'login' | 'register';

export default function AdminAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const initialTab = (searchParams.get('tab') === 'register' ? 'register' : 'login') as TabMode;
  const [mode, setMode] = useState<TabMode>(initialTab);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const setLoginMode = useCallback(() => {
    setMode('login');
    setError('');
    setSuccessMessage('');
  }, []);

  const setRegisterMode = useCallback(() => {
    setMode('register');
    setError('');
    setSuccessMessage('');
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSuccessMessage('');

      if (mode === 'login') {
        if (!username.trim() || !password) {
          setError('Username and password are required');
          return;
        }
        setLoading(true);
        try {
          const data = await adminApi.login(username.trim(), password);
          login(data.token, data.admin);
          router.replace('/admin');
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Login failed';
          const lower = msg.toLowerCase();
          if (lower.includes('invalid') || lower.includes('credentials')) setError('Invalid username or password');
          else if (lower.includes('fetch') || lower.includes('network')) setError('Network error. Check your connection.');
          else setError(msg);
        } finally {
          setLoading(false);
        }
        return;
      }

      if (mode === 'register') {
        if (!username.trim()) {
          setError('Username is required');
          return;
        }
        if (!password) {
          setError('Password is required');
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        setLoading(true);
        try {
          await adminApi.register(name.trim() || username.trim(), username.trim(), password);
          setSuccessMessage('Account created! Sign in below.');
          setMode('login');
          setPassword('');
          setConfirmPassword('');
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Registration failed';
          const lower = msg.toLowerCase();
          if (lower.includes('exists')) setError('Username already exists');
          else if (lower.includes('reserved') || (username.trim().toLowerCase() === 'admin' && lower.includes('username'))) setError('Username "admin" is reserved for the system.');
          else if (lower.includes('fetch') || lower.includes('network')) setError('Network error. Check your connection.');
          else setError(msg);
        } finally {
          setLoading(false);
        }
      }
    },
    [mode, username, password, confirmPassword, name, login, router]
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900">
      <Card className="w-full max-w-sm p-6 shadow-xl border-dark-500 bg-dark-800/95 backdrop-blur">
        <div className="flex gap-1 p-1 rounded-xl bg-dark-700 border border-dark-600 mb-6">
          <button
            type="button"
            onClick={setLoginMode}
            className={cn(
              'flex-1 py-2.5 rounded-lg text-sm font-medium transition min-h-[44px]',
              mode === 'login'
                ? 'bg-accent-primary text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            🔐 Login
          </button>
          <button
            type="button"
            onClick={setRegisterMode}
            className={cn(
              'flex-1 py-2.5 rounded-lg text-sm font-medium transition min-h-[44px]',
              mode === 'register'
                ? 'bg-accent-primary text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            👤 Register
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-100">
            {mode === 'login' ? 'Admin Login' : 'Admin Registration'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {mode === 'login'
              ? 'Sign in to manage events'
              : 'Create a new admin account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <Input
              label="Admin name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              className="min-h-[44px]"
            />
          )}
          <Input
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            required
            autoComplete="username"
            className="min-h-[44px]"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            className="min-h-[44px]"
          />
          {mode === 'register' && (
            <Input
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              className="min-h-[44px]"
            />
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
          {successMessage && <p className="text-sm text-emerald-400">{successMessage}</p>}

          <Button
            type="submit"
            fullWidth
            loading={loading}
            className="min-h-[48px]"
          >
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <Link
          href="/"
          className="block mt-6 text-center text-sm text-slate-500 hover:text-slate-300 min-h-[44px] flex items-center justify-center"
        >
          ← Back to Events
        </Link>
      </Card>
    </div>
  );
}
