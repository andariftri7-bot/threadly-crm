'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store-context';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isSuperadmin } = useStore();

  useEffect(() => {
    if (isSuperadmin) {
      router.replace('/admin');
    }
  }, [isSuperadmin, router]);

  if (isSuperadmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-ivory-100 dark:bg-navy-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
