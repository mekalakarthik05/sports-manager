'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function LogoutButton() {
  const router = useRouter();
  const { logout } = useAuth();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    logout();
    router.replace('/admin/login');
  }

  return (
    <Link href="/admin/login" onClick={handleClick} className="text-sm text-slate-400 hover:text-slate-200">
      Logout
    </Link>
  );
}
