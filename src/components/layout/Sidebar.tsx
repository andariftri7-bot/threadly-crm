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
  LogOut,
  ExternalLink,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { currentStore, currentUser, logout } = useStore();

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
    <aside className="hidden sm:flex flex-col w-20 lg:w-64 bg-card border-r border-border h-screen sticky top-0 z-30 select-none text-card-foreground transition-all duration-200">
      {/* Brand Header */}
      <div className="h-16 px-4 lg:px-6 flex items-center border-b border-border justify-center lg:justify-start">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary dark:bg-secondary text-primary-foreground dark:text-secondary-foreground flex items-center justify-center font-bold text-base shadow-sm flex-shrink-0">
            T
          </div>
          <div className="hidden lg:block">
            <span className="font-bold text-lg text-card-foreground tracking-tight">
              Threadly
            </span>
            <span className="text-[10px] font-bold text-secondary block -mt-1 tracking-wider uppercase">
              Fashion CRM
            </span>
          </div>
        </Link>
      </div>

      {/* Static Current Store Display (No dropdown - 1 Account = 1 Store) */}
      <div className="p-3 lg:p-4 border-b border-border">
        <div className="p-2 lg:p-3 rounded-xl bg-muted/70 border border-border space-y-2">
          <div className="flex items-center justify-center lg:justify-between">
            <span className="hidden lg:inline text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Toko Saya
            </span>
            <span className="text-[10px] px-1.5 lg:px-2 py-0.5 rounded-full font-bold bg-secondary/15 text-secondary capitalize border border-secondary/30">
              {currentStore?.plan || 'Standar'}
            </span>
          </div>

          <p className="hidden lg:block text-sm font-bold text-card-foreground truncate">
            {currentStore?.name || 'Toko Fashion'}
          </p>

          {currentStore && (
            <div className="pt-1.5 border-t border-border flex justify-center lg:justify-start">
              <Link
                href={`/${currentStore.slug}`}
                target="_blank"
                title="Buka Etalase Publik"
                className="flex items-center gap-1.5 text-xs text-secondary hover:underline font-semibold transition"
              >
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
                <span className="hidden lg:inline">Buka Etalase Publik</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Nav Menu Items */}
      <nav className="flex-1 px-2 lg:px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 justify-center lg:justify-start touch-target',
                isActive
                  ? 'bg-secondary bg-gradient-accent text-white shadow-sm font-bold'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="w-5 h-5 lg:w-4 lg:h-4 flex-shrink-0" strokeWidth={1.5} />
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User profile bottom footer */}
      <div className="p-3 lg:p-4 border-t border-border flex items-center justify-center lg:justify-between">
        <div className="hidden lg:block truncate pr-2">
          <p className="text-xs font-bold text-card-foreground truncate">
            {currentUser?.full_name || 'Penjual Fashion'}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
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
          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition flex items-center justify-center touch-target"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
}
