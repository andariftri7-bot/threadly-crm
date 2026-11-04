'use client';

import React from 'react';
import { useStore } from '@/lib/store-context';
import { Bell, X, Store as StoreIcon, LogOut } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export function Header() {
  const {
    currentStore,
    lastRealtimeNotification,
    clearNotification,
    logout,
  } = useStore();

  return (
    <header className="sticky top-0 z-20 bg-[#0F172A] bg-gradient-brand text-white border-b border-white/10 shadow-sm backdrop-blur-md">
      {/* Realtime Notification Toast */}
      {lastRealtimeNotification && (
        <div className="bg-emerald-700 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between shadow-sm animate-in slide-in-from-top">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 animate-bounce" strokeWidth={1.5} />
            <span>{lastRealtimeNotification}</span>
          </div>
          <button
            onClick={clearNotification}
            className="p-1 hover:bg-emerald-800 rounded-md transition"
            aria-label="Tutup Notifikasi"
          >
            <X className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* Main Header Bar */}
      <div className="h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-white tracking-tight">
            {currentStore?.name || 'Threadly CRM'}
          </h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/15 text-slate-100 font-medium border border-white/20">
            WIB (Asia/Jakarta)
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Switcher: Terang / Gelap / Sistem */}
          <ThemeToggle />

          {currentStore && (
            <Link
              href={`/${currentStore.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/25 bg-white/10 text-xs font-semibold text-white hover:bg-white/20 transition shadow-sm"
            >
              <StoreIcon className="w-3.5 h-3.5 text-[#EBD9B4]" strokeWidth={1.5} />
              <span>Lihat Etalase Publik</span>
            </Link>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              logout();
            }}
            title="Keluar akun"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/25 bg-white/10 text-xs font-semibold text-white hover:text-rose-200 hover:border-rose-400 hover:bg-rose-950/60 transition shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
