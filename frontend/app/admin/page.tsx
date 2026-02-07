'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AdminHomePage() {
  const { admin } = useAuth();

  return (
    <div className="px-4 py-6 space-y-6">
      <p className="text-slate-400 text-sm">
        Logged in as <span className="text-slate-200 font-medium">{admin?.name || admin?.username}</span>
      </p>
      <div className="grid gap-3">
        <Link href="/admin/events">
          <Card className="flex items-center justify-between card-tap p-4">
            <span className="font-medium text-slate-100">🏆 Events</span>
            <span className="text-slate-500">→</span>
          </Card>
        </Link>
        <Link href="/admin/teams">
          <Card className="flex items-center justify-between card-tap p-4">
            <span className="font-medium text-slate-100">⚽ Teams</span>
            <span className="text-slate-500">→</span>
          </Card>
        </Link>
        <Link href="/admin/matches">
          <Card className="flex items-center justify-between card-tap p-4">
            <span className="font-medium text-slate-100">📅 Matches</span>
            <span className="text-slate-500">→</span>
          </Card>
        </Link>
      </div>
    </div>
  );
}
