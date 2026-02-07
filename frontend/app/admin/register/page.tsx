'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRegisterRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/login?tab=register');
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900">
      <p className="text-slate-500">Redirecting...</p>
    </div>
  );
}
