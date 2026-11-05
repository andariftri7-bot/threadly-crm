'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store-context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Receipt,
  Package,
  MoreHorizontal,
  BellRing,
  Store as StoreIcon,
  PenLine,
  Settings,
  LogOut,
  X,
  ExternalLink,
} from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();
  const { currentStore, currentUser, logout } = useStore();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainTabs = [
    { label: 'Beranda', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Pelanggan', href: '/customers', icon: Users },
    { label: 'Pesanan', href: '/orders', icon: Receipt },
    { label: 'Produk', href: '/products', icon: Package },
  ];

  const moreItems = [
    { label: 'Tindak Lanjut', href: '/followup', icon: BellRing, desc: 'Pengingat retensi & restock' },
    { label: 'Etalase Bio', href: '/storefront-preview', icon: StoreIcon, desc: 'Pratinjau toko publik' },
    { label: 'Asisten AI', href: '/ai', icon: PenLine, desc: 'Otomatisasi chat & persona' },
    { label: 'Pengaturan', href: '/settings', icon: Settings, desc: 'Profil toko & anggota tim' },
  ];

  const isMoreActive = moreItems.some(item => pathname === item.href || pathname.startsWith(item.href));

  return (
    <>
      {/* "Lainnya" Bottom Sheet Drawer */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMoreOpen(false)}
          />

          {/* Sheet Container */}
          <div className="fixed bottom-0 inset-x-0 bg-card border-t border-border rounded-t-3xl p-5 pb-safe z-10 space-y-4 animate-in slide-in-from-bottom duration-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-secondary text-white flex items-center justify-center font-bold text-xs">
                  T
                </div>
                <div>
                  <h3 className="text-sm font-bold text-card-foreground">Menu Tambahan</h3>
                  <p className="text-[11px] text-muted-foreground">{currentStore?.name || 'Toko Fashion'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="p-2 rounded-xl text-muted-foreground hover:bg-muted touch-target flex items-center justify-center"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Quick public storefront link */}
            {currentStore && (
              <Link
                href={`/${currentStore.slug}`}
                target="_blank"
                onClick={() => setIsMoreOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl bg-secondary/10 border border-secondary/20 text-xs font-semibold text-secondary hover:bg-secondary/15 transition touch-target"
              >
                <div className="flex items-center gap-2">
                  <StoreIcon className="w-4 h-4" strokeWidth={1.5} />
                  <span>Buka Etalase Publik Bio</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
              </Link>
            )}

            {/* More navigation links */}
            <div className="grid grid-cols-1 gap-1.5 pt-1">
              {moreItems.map(item => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-2xl transition touch-target',
                      isActive
                        ? 'bg-secondary bg-gradient-accent text-white font-bold shadow-sm'
                        : 'hover:bg-muted text-card-foreground'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center',
                        isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                      )}>
                        <Icon className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold leading-tight">{item.label}</p>
                        <p className={cn(
                          'text-[10px] leading-tight mt-0.5 font-medium',
                          isActive ? 'text-white/80' : 'text-muted-foreground'
                        )}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* User Profile & Logout */}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <div className="truncate pr-2">
                <p className="text-xs font-bold text-card-foreground truncate">
                  {currentUser?.full_name || 'Penjual'}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {currentUser?.email || 'owner@toko.id'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsMoreOpen(false);
                  logout();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition touch-target"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.5} />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Navigation Bar */}
      <nav
        aria-label="Navigasi Bawah"
        className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-md border-t border-border pb-safe shadow-lg"
      >
        <div className="grid grid-cols-5 h-14 items-center">
          {mainTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(tab.href));

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex flex-col items-center justify-center h-full text-[10px] font-semibold transition touch-target',
                  isActive
                    ? 'text-secondary font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className={cn('w-5 h-5 mb-0.5', isActive && 'stroke-[2.2]')} strokeWidth={1.5} />
                <span>{tab.label}</span>
              </Link>
            );
          })}

          {/* "Lainnya" trigger button */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center h-full text-[10px] font-semibold transition touch-target',
              isMoreActive || isMoreOpen
                ? 'text-secondary font-bold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <MoreHorizontal className={cn('w-5 h-5 mb-0.5', (isMoreActive || isMoreOpen) && 'stroke-[2.2]')} strokeWidth={1.5} />
            <span>Lainnya</span>
          </button>
        </div>
      </nav>
    </>
  );
}
