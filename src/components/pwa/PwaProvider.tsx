'use client';

import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Threadly PWA ServiceWorker terdaftar:', registration.scope);
          })
          .catch((err) => {
            console.warn('Gagal mendaftarkan ServiceWorker:', err);
          });
      });
    }

    // 2. Check if already installed in standalone mode
    if (typeof window !== 'undefined') {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      if (isStandalone) {
        setIsInstalled(true);
      }
    }

    // 3. Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Only show banner if user has not dismissed it recently
      const dismissed = localStorage.getItem('threadly_pwa_dismissed');
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    localStorage.setItem('threadly_pwa_dismissed', 'true');
  };

  return (
    <>
      {children}

      {/* Floating Install Prompt Banner (Mobile & Desktop) */}
      {showInstallBanner && !isInstalled && (
        <aside
          aria-label="Install Aplikasi"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 bg-card border border-border/80 shadow-2xl rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-md animate-in slide-in-from-bottom duration-300"
        >
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-sm">
            T
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-foreground truncate">
              Pasang Aplikasi Threadly
            </h4>
            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
              Akses cepat tanpa browser, responsif &amp; offline ready di layar utama.
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="py-1.5 px-3 rounded-lg bg-secondary text-secondary-foreground text-xs font-bold hover:opacity-90 transition flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Install</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
