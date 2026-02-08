import { Suspense } from 'react';
import AdminAuthClient from './AdminAuthClient';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-900" />}>
      <AdminAuthClient />
    </Suspense>
  );
}
