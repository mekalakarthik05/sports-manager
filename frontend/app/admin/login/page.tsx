import { Suspense } from 'react';
import AdminAuthClient from './AdminAuthClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-900" />}>
      <AdminAuthClient />
    </Suspense>
  );
}
