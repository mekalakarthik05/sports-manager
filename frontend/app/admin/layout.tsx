'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { LogoutButton } from '@/components/admin/LogoutButton';
import { cn } from '@/lib/utils';

const adminNav = [
  { href: '/admin', label: 'Home', exact: true },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/teams', label: 'Teams' },
  { href: '/admin/matches', label: 'Matches' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, admin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === '/admin/login' || pathname === '/admin/register';

  useEffect(() => {
    if (pathname?.startsWith('/admin') && !isAuthPage && !isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, pathname, router, isAuthPage]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="animate-pulse text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-dark-900">
      <header className="sticky top-0 z-20 bg-dark-800 border-b border-dark-600 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-lg font-semibold text-slate-100 truncate">Admin</h1>
            {admin?.role === 'super_admin' ? (
              <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/50">
                SUPER ADMIN
              </span>
            ) : null}
          </div>
          <LogoutButton />
        </div>
      </header>
      <nav className="sticky top-[52px] z-10 flex overflow-x-auto hide-scrollbar gap-1 px-4 py-2 bg-dark-900 border-b border-dark-600">
        {adminNav.map((item) => {
          const active = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap',
                active ? 'bg-accent-primary text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-dark-600'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <main className="flex-1 pb-24">{children}</main>
      <footer
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center bg-dark-800 border-t border-dark-600 py-3"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <Link
          href="/"
          className="text-sm text-slate-400 hover:text-slate-200"
        >
          ← Back to Events
        </Link>
      </footer>
    </div>
  );
}
