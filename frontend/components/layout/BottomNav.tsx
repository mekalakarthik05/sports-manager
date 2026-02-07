'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Events', icon: '🏆' },
  { href: '/admin', label: 'Admin', icon: '⚙️' },
];

export function BottomNav() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-dark-800 border-t border-dark-600 safe-bottom-nav"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      {navItems.map((item) => {
        const active = item.href === '/' ? pathname === '/' : isAdmin;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center flex-1 py-3 text-xs font-medium transition',
              active ? 'text-accent-primary' : 'text-slate-500 hover:text-slate-300'
            )}
          >
            <span className="text-lg mb-0.5">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
