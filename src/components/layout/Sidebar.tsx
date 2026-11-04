'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store-context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Receipt,
  Package,
  BellRing,
  Store as StoreIcon,
  PenLine,
  Settings,
  ShieldCheck,
  ChevronDown,
  LogOut,
  ExternalLink,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { currentStore, currentUser, logout, isSuperadmin } = useStore();

  const navItems = [
    { label: 'Beranda', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Pelanggan', href: '/customers', icon: Users },
    { label: 'Pesanan', href: '/orders', icon: Receipt },
    { label: 'Produk & Stok', href: '/products', icon: Package },
    { label: 'Tindak Lanjut', href: '/followup', icon: BellRing },
    { label: 'Etalase', href: '/storefront-preview', icon: StoreIcon },
    { label: 'Asisten AI', href: '/ai', icon: PenLine },
    { label: 'Pengaturan', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-navy-900 border-r border-slate-200 dark:border-navy-800 flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center border-b border-slate-100 dark:border-navy-800">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-navy-900 dark:bg-violet-600 text-ivory-100 dark:text-white flex items-center justify-center font-bold text-base shadow-sm">
            T
          </div>
          <div>
            <span className="font-bold text-lg text-navy-900 dark:text-ivory-100 tracking-tight">
              Threadly
            </span>
            <span className="text-[10px] font-medium text-violet-600 dark:text-violet-400 block -mt-1 tracking-wider uppercase">
              Fashion CRM
            </span>
          </div>
        </Link>
      </div>

      {/* Static Current Store Display (No dropdown - 1 Account = 1 Store) */}
      <div className="p-4 border-b border-slate-100 dark:border-navy-800">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-800/80 border border-slate-200/60 dark:border-navy-700/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Toko Saya
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 capitalize border border-violet-200 dark:border-violet-800">
              {currentStore?.plan || 'Standar'}
            </span>
          </div>

          <p className="text-sm font-bold text-navy-900 dark:text-ivory-100 truncate">
            {currentStore?.name || 'Toko Fashion'}
          </p>

          {currentStore && (
            <div className="pt-1.5 border-t border-slate-200/60 dark:border-navy-700/60">
              <Link
                href={`/${currentStore.slug}`}
                target="_blank"
                className="flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium transition"
              >
                <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Buka Etalase Publik</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Nav Menu Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-accent text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800 hover:text-navy-900 dark:hover:text-ivory-100'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User profile bottom footer */}
      <div className="p-4 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
        <div className="truncate pr-2">
          <p className="text-xs font-bold text-navy-900 dark:text-ivory-100 truncate">
            {currentUser?.full_name || 'Penjual Fashion'}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {currentUser?.email || 'owner@toko.id'}
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            logout();
          }}
          title="Keluar Akun"
          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition flex items-center justify-center"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
}
